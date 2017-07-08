global.rpc = new (require('../Modules/rpc.js'))(true);
vmscript = new (require('../VMScript.js'))();
path = require('path');

global.api = {};
global.api.spawnScript = function(script) {
	process.directory = path.join(process.cwd(), path.dirname(script));
	vmscript.watch(script);
}

global.rpc.add(global.api);

// console.log("Setting up process env");

// fs = require('fs');
// var vm = require('vm');

// api = {};

// api.spawnScript = vmscript.watch;
// api.runInContext = function(code){
// 	try{
// 		vm.runInThisContext(code);
// 	}catch(e){
// 		console.log(e);
// 	}
// };
// console.log = console.error;
// console.dir = console.error;


// ChildSpawner = require('../Helper/ChildSpawner.js');

// Prevent the following warning about possible memory leak with the EventEmitters.
// (node) warning: possible EventEmitter memory leak detected. 11 listeners added. Use emitter.setMaxListeners() to increase limit.
// process.setMaxListeners(0);

// var client = ChildSpawner.Resume();
