/*    Copywrite Przemyslaw Walczak & Liam Mitchell 2015
 *    This file is part of vmscript.
 *
 *    vmscript is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    vmscript is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with vmscript.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * A singleton module for virtalized script loading.
 * Watches scripts and reloads them at runtime.
 * @module  vmscript
 */


// TODO: Fix a memory leak due to 11 > listeners warning.

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
EventEmitter = new EventEmitter();
var vm = require('vm');
var path = require('path');

var JSONParser = require('jsonlint').parser;
var jshint = require('jshint').JSHINT;
var clc = require('cli-color');
var colors = {orange: clc.xterm(202), info: clc.xterm(33)};

/**
 * A utility function to console log an error exception.
 * @param  {Exception|String} err The error/exception.
 * @deprecated We might remove this in the future.
 */
function dumpError(err) {
  if (typeof err === 'object') {
    if (err.message) {
      console.error('\n\r\x1b[31;1mException: ' + err.message+'\x1b[0m\n\r');
    }

    // if (err.stack) {
    //   console.error('\x1b[31;1mStacktrace:\x1b[0m','\n',err.stack.split('\n').splice(1).join('\n'));
    // }
  } else {
    console.error('\x1b[31;1m' + err+'\x1b[0m');
  }
}

var array = {};
var fileStats = {};
var dependencies = {};

/**
 * VMScript Object.
 * @constructor
 */
function VMScriptObj(){
	global.vms = this.vms;
	// global.vmscript = this;
	this.readyListeners = [];

	var self = this;

	EventEmitter.on('file added', function(file_path){

		var file_name = getFilename(path.parse(file_path));
		console.log(colors.orange("[VMS]"), colors.info("added:"), file_name);

		self.parse(file_path);
	});

	EventEmitter.on('file changed', function(file_path){

		var file_name = getFilename(path.parse(file_path));
		console.log(colors.orange("[VMS]"), colors.info("changed:"), file_name);

		self.parse(file_path);
	});

	EventEmitter.on('file removed', function(file_path){
		var file_name = getFilename(path.parse(file_path));
		console.log(colors.orange("[VMS]"), colors.orange("removed:"), file_name);

		self.parse(file_path);
	});

	EventEmitter.on('dependency loaded', function(name){
		for(var i=0; i<self.readyListeners.length; i++){
			var listener = self.readyListeners[i];
			if(typeof listener.name === 'object'){
				if(!listener.loaded) listener.loaded = [];
				if(listener.name.indexOf(name) > -1 && listener.loaded.indexOf(name) === -1)
					listener.loaded.push(name);

				if(listener.name.length === listener.loaded.length){
					listener.callback();
					self.readyListeners.splice(i, 1);
				}
			}else{
				if(listener.name === name){
					listener.callback();
					self.readyListeners.splice(i, 1);
				}
			}
		}
	});

	EventEmitter.on('check dependencies', function(){
		for(var dependent in dependencies){
			var d = dependencies[dependent];

      var loaded;
			if(d.depends && !d.running && !d.hasError){
				loaded = 0;
				for(var i=0; i<d.depends.length; i++){
					var dp = d.depends[i];
					if(dependencies[dp] && dependencies[dp].running){
						loaded++;
					}
				}

				if(loaded === d.depends.length){
					if(d.callback){
						try{
							d.callback();
							d.running = true;
							EventEmitter.emit('check dependencies');
							EventEmitter.emit('dependency loaded', dependent);
						}catch(e){
							console.log(e);
							d.hasError = true;
						}
					}
				}
			} else if(d.files && !d.running){
				loaded = 0;
				for(var i=0; i<d.files.length; i++){
					var name = getFilename(path.parse(d.files[i]));
					if ( (dependencies[name] && dependencies[name].running) || self[name] !== undefined || global[name] !== undefined) {
						loaded++;
					}
				}

				if(loaded === d.files.length){
					d.running = true;
					EventEmitter.emit('dependency loaded', dependent);
					EventEmitter.emit('check dependencies');
				}
			}
		}

		// Check ready listeners
		for(var i=0; i<self.readyListeners.length; i++){
			var listener = self.readyListeners[i];

			if(typeof listener.name === 'object'){
				listener.loaded = [];

				for (var j = 0; j< listener.name.length; j++) {
					if ((dependencies[listener.name[j]] && dependencies[listener.name[j]].running) || self[listener.name[j]] !== undefined || global[listener.name[j]] !== undefined) {
						listener.loaded.push(listener.name[j]);
					}
				}

				if(listener.name.length === listener.loaded.length){
					listener.callback();
					self.readyListeners.splice(i, 1);
				}
			} else {
				if ((dependencies[listener.name] && dependencies[listener.name].running) || self[listener.name] !== undefined || global[listener.name] !== undefined) {
					listener.callback();
					self.readyListeners.splice(i, 1);
				}
			}
		}


	});
};

/**
 * Reads the file contents and runs it in this context using node.js's vm.
 * This is intended to be used internally. Can parse json and js files.
 * Runs a jshint if there is a problem loading the file.
 * @param  {String|Path} file_path The file path.
 */
VMScriptObj.prototype.parse = function(file_path){
	fs.readFile(file_path, function(err, content){
		if(err){
			// console.log(err);
			return;
		}

		var infos = path.parse(file_path);
		var ext = infos.ext.toLowerCase();
		var code = content.toString();

		global.require = require;
		global.file_path = file_path;

		var split_dir = infos.dir.split(path.sep);
		var file_name = getFilename(infos);

		dependencies[file_name] = {
			running: false,
			file_path: file_path
		};

		switch(ext){
			case '.json':
			try{
				vm.runInThisContext(split_dir[split_dir.length-1].toLowerCase() + '.' + infos.name + ' = ' + code + ';');
				dependencies[file_name].running = true;
				EventEmitter.emit('check dependencies');
			}catch(e){
				try{
					vm.runInThisContext(split_dir[split_dir.length-1].toLowerCase() + ' = {};');
					vm.runInThisContext(split_dir[split_dir.length-1].toLowerCase() + '.' + infos.name + ' = ' + code + ';');
					dependencies[file_name].running = true;
					EventEmitter.emit('check dependencies');
				}catch(e){
					try{
						JSONParser.parse(code.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:\/\/(?:.*)$)/gm,
							function (match) {
								return new Array(match.split('\n').length).join('\n');
							}));
					}catch(e){
						dumpError('File: '+file_name+'\n'+e);
					}
				}
			}
			break;

			case '.js':
			try{
				vm.runInThisContext(code);
				dependencies[file_name].running = true;
				EventEmitter.emit('check dependencies');
			}catch(e){
		      console.log(e);
		      if (!jshint(content.toString())) {
		        for (var i=0;i<jshint.errors.length;i++) {
		          var e = jshint.errors[i];
		          if (!e) { continue; }
		        }
		      }
			}
			break;
		}

		delete global.file_path;
	});
};

/**
 * Function to return a file name based on directory and name.
 * @param  {object} infos Infos object.
 * @return {String}       Filename.
 */
function getFilename(infos){
	var split_dir = infos.dir.split(path.sep);
	// TODO: Consider adding a __dirname check if we wont name the file outside project directory.
	return split_dir[split_dir.length-1] + '/' + infos.name + infos.ext.toLowerCase();
}

/** 
 * Function used to watch the file or directory for changes.
 * @param  {String|Path} file_path The file path.
 * @param  {Object} opts      Options.
 */
VMScriptObj.prototype.watch = function(file_path, opts){
	file_path = path.resolve(file_path);
	if(array[file_path]) return;

	var directory = false;
	fs.stat(file_path, function(err, stats){
		if(err){
			dumpError(err);
			return;
		}

		fs.watch(file_path, function(){
			if(directory){
				fs.readdir(file_path, function(err, files){
					if(err){
						dumpError(err);
						return;
					}

					files = files.filter(function(file){
						var infos = path.parse(file_path + path.sep + file);
						return infos.ext !== '.tmp' && infos.ext !== '.TMP';
					});

					for(var i=0; i<files.length; i++){
						files[i] = file_path + path.sep + files[i];
						try{
							var stat = fs.statSync(files[i]);
							var index = array[file_path].files.indexOf(files[i]);
							if(index > -1){
								var prvStat = fileStats[files[i]];

								if(prvStat.mtime.getTime() !== stat.mtime.getTime()){
									fileStats[files[i]] = stat;
									EventEmitter.emit('file changed', files[i]);
								}
								continue;
							}

							array[file_path].files.push(files[i]);
							fileStats[files[i]] = stat;
							EventEmitter.emit('file added', files[i]);
						}catch(e){
							dumpError(e);
						}
					}

					for(var i=0; i<array[file_path].files.length; i++){
						var f = array[file_path].files[i];
						try{
							fs.statSync(f);
						}catch(err){
							EventEmitter.emit('file removed', err.path);
							array[file_path].files.splice(
								array[file_path].files.indexOf(err.path),
								1
							);
						}
					}
				});
			}else{
				if(array[file_path]){
					fs.stat(file_path, function(err, stat){
						if(err){
							// delete array[file_path];
							// localEmitter.emit('file remove', err.path);
							// console.log('Removed file:', err.path);
							return;
						}

						var prvStat = array[file_path].stats;

						if(prvStat.mtime.getTime() !== stat.mtime.getTime()){
							array[file_path].stats = stat;
							EventEmitter.emit('file changed', file_path);
						}
					});
				}
			}
		});

		if(stats.isDirectory()){
			directory = true;
			array[file_path] = {
				files: []
			};

			var split_file_path = file_path.split(path.sep);
			dependencies[split_file_path[split_file_path.length-1]] = {
				files: [],
				running: false
			};

			fs.readdir(file_path, function(err, files){
				if(err){
					dumpError(err);
					return;
				}

				for(var i=0; i<files.length; i++){
					var fp = file_path + path.sep + files[i];
					dependencies[split_file_path[split_file_path.length-1]].files.push(fp);
					array[file_path].files.push(fp);
					fileStats[fp] = fs.statSync(fp);
					EventEmitter.emit('file added', fp);
				}

				EventEmitter.emit('check dependencies');
			});
		}else if(stats.isFile()){
			array[file_path] = {
				stats: stats
			};

			EventEmitter.emit('file added', file_path);
		}
	});
	return this;
};

/**
 * When dependencies have been loaded call the ready function.
 * @param  {String|Array} name  A string or array of strings for dependencies needed to run the ready function.
 * @param  {Function} ready The ready function to call when dependencies are loaded.
 * @deprecated Please use once to be similar to other Modules in node.js which use on to repeditively do something based on events and once to do something only once.
 */
VMScriptObj.prototype.on = function(name, ready){
	if(typeof name === 'object'){
		var obj = {
			name: name,
			callback: ready,
			loaded: []
		};

		for(var n in name){
			var na = name[n];
			if ( (dependencies[na] && dependencies[na].running) || this[na] !== undefined || global[na] !== undefined) {
				obj.loaded.push(na);
			}
		}

		if(obj.name.length === obj.loaded.length){
			obj.callback();
		}else{
			this.readyListeners.push(obj);
		}
	}else{
		var dependency = dependencies[name];
		if(dependency && dependency.running){
			ready();
		}else{
			this.readyListeners.push({name: name, callback: ready});
		}
	}
};

/**
 * When dependencies have been loaded call the ready function.
 * @param  {String|Array} name  A string or array of strings for dependencies needed to run the ready function.
 * @param  {Function} ready The ready function to call when dependencies are loaded.
 */
VMScriptObj.prototype.once = VMScriptObj.prototype.on;

/**
 * Exposes function to global scope for registering dependencies.
 * @param  {String}   name     The name of this vmscript.
 * @param  {String|Array}   depends  Dependencies.
 * @param  {Function} callback Call Back function to execute when dependencies are met.
 */
VMScriptObj.prototype.vms = function(name, depends, callback){
	// console.log(this.file_path);
	// console.log(name);
	dependencies[name] = {
		running: false,
		depends: depends,
		callback: callback
	};

	EventEmitter.emit('check dependencies');
};

/**
 * A module that exports methods to watch script files for changes.
 * And to load scripts at runtime.
 * @module vmscript
 */
module.exports = VMScriptObj;
