vmscript.watch('Config/network.json');
vmscript.watch('Config/login.json');
vmscript.watch('Config/world.json');
vmscript.watch('Config/newCharacter.json');

vms('Login Server', [
	'Config/network.json',
	'Config/login.json',
	'Config/world.json',
	'Config/newCharacter.json'
], function(){
	net = require('net');
	CachedBuffer = require('./Modules/CachedBuffer.js');
	PacketCollection = require('./Modules/PacketCollection.js');
	restruct = require('./Modules/restruct');
	Database = require('./Modules/db.js');
	crypto = require('crypto');
	hexy = require('hexy').hexy;
	util = require('./Modules/util.js');
	util.setupUncaughtExceptionHandler();
	os = require('os');
	Netmask = require('netmask').Netmask;

	bunyan = require('bunyan');

	vmscript.watch('./Generic/structs.js');
	vmscript.watch('./Generic/CharacterInfos.js');

	global.api.sendSocketAfterTransferQueue = function(username){
		console.log('LOGIN Send socket.... a', username);
		if(Login.characterTransfer[username]){
			console.log("Sending response");
			Login.characterTransfer[username]();
			delete Login.characterTransfer[username];
		}
	};

	global.rpc.add(global.api);

	/**
	 * LoginInstance, there should only be 1.
	 * @exports LoginInstance
	 */
	function LoginInstance(){
		log = bunyan.createLogger({name: 'InfiniteSky/Login',
		    streams: [{
		        stream: process.stderr
		    }]
		});

		console.log('Started');

		/**
		 * Array of current connected clients.
		 */
		this.clients = [];
		this.nextID = 0;

		/**
		 * Boolean indicating that the server is running
		 * and listening for incoming connections.
	             */
		this.listening = false;

		/**
		 * Used Later to see if config has to offer a new port to listen to.
		 * If is different than currently listening, re-listen the tcp server,
		 * to listen for the new port.
		 */
		this.listeningPort = null;

		/**
		 * A boolean variable to decide if we want to accept incoming connections.
		 */
		this.acceptConnections = false;

		/**
		 * A object of packet collection for this current instance.
	   	 */
		this.packetCollection = null;

		var self = this;
		/**
		 * A TCP server instance.
		 */
		this.instance = net.createServer(function (socket) { self.onConnection(socket); });
		this.recv = {};
		this.send = {};

		this.databaseConnected = false;
		this.characterTransfer = {};
	}

	/**
	 * Action taken upon connection to the Login Server.
	 * @param  {socket} socket The client socket.
	 */
	LoginInstance.prototype.onConnection = function(socket){
		if(!this.acceptConnections) return;

		var self = this;
		socket.clientID = this.nextID;
		socket.hash = crypto.randomBytes(12);
		for(var i=0; i < socket.hash.length; i++){
			while(socket.hash[i] === 0x00){
				var rb = crypto.randomBytes(1);
				socket.hash[i] = rb[0];
			}
		}

		this.nextID++;
		socket.authenticated = false;

		this.clients.push(socket);
		CachedBuffer.call(socket, this.packetCollection);

		console.log("[Login] new Connection #" + socket.clientID);

		try {
			this.onConnected(socket);
		} catch (e) {
			console.log(e);
		}

		socket.on('end', function() {
			return self.onDisconnect(socket);
		});

		// Need to find out which functions to use and make this tidyer....
		// Need to check for memory leaks and make sure we actually delete the un needed socket.
		// Need to make sure using splice won't be slower than deleting the index.
		// Should maybe look at using room or list rather than array of socket object.
		socket.on('close', function() {
			return self.onDisconnect(socket);
		});

		socket.on('disconnect', function() {
			return self.onDisconnect(socket);
		});

		socket.on('error', function(err) {
			return self.onError(err, socket);
		});
	};

	/**
	 * Action taken upon disconnection from the Login Server.
	 * @param  {socket} socket The client socket.
	 */
	LoginInstance.prototype.onDisconnect = function(socket){
		var index = this.clients.indexOf(socket);
		if(index !== -1){
			console.log("[Login] connection closed #" + socket.clientID);
			this.clients.splice(this.clients.indexOf(socket), 1);
			socket.destroy();
		}
	};

	/**
	 * Action taken upon connection to the Login Server.
	 * @param {exception} err An error.
	 * @param  {socket} socket The client socket.
	 */
	LoginInstance.prototype.onError = function(err, socket){
		console.log(err);
		this.clients.splice(this.clients.indexOf(socket), 1);
		socket.destroy();
	};

	/**
	 * Initalizes the Login Instance.
	 * Loads up packets, database, structures etc.
	 */
	LoginInstance.prototype.init = function(){
		if(this.listening) return;

		var self = this;
		this.instance.listen(config.network.ports.login, function(){
			self.listening = true;
			self.listeningPort = config.network.ports.login;
			console.log("Login Server Instance listening on:", self.listeningPort);
		});

		this.packetCollection = new PacketCollection('LoginPC');

		Database(config.login.database.connection_string, function(){
			console.log("Database connected @", config.login.database.connection_string);
			vmscript.watch('Database');
			vmscript.watch('./Processes/Login/Packets').on([
					'Packets',
					'Database',
					'Generic/structs.js'
				], function(){
					// db.account.create
					self.acceptConnections = true;
			});
		});
	}

	if(typeof Login === 'undefined') {
		global.Login = new LoginInstance();
		global.Login.init();
	} else {
		global.Login.__proto__ = LoginInstance.prototype;
	}

	global.rpc.add(global.api);
});
