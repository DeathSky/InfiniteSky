module.exports = function(grunt) {
  grunt.registerTask('npcToMongo', 'Loads npc from the game file 005_00006.IMG into Mongo.', function() {
  	var done = this.async();
  	//vmscript.watch('Config/login.json');
	var vmscript = new (require('../VMScript.js'))();
	Database = require('../Modules/db.js');
	var GameInfoLoader = require('../Modules/GameInfoLoader.js');
	var restruct = require('../Modules/restruct');
	var encoding = require('encoding');


  	vmscript.on(['config'], function() {
  		console.log('Starting config check for npcToMongo.');
  		if (!config.world) {
			console.error('Expecting config.world to be set.');
	  		return done(false);
  		}

	  	if (!config.world.database || !config.world.database.connection_string) {
	  		console.error('Expecting config.world.database.connection_string to be set.');
	  		return done(false);
	  	}

	  	if (!config.world.info_directory) {
	  		console.error('Expecting config.world.info_directory to be set. Please run grunt init or grunt locateGameFiles.');
	  		return done(false);
	  	}

		Database(config.world.database.connection_string, function(){
			console.log("Database connected");
			vmscript.watch('Database/npc.js');
		});

  	});

  	vmscript.on(['NPC'], function() {
  		console.log('Clearing all existing NPCS in MongoDB.');
  		db.NPC.remove().exec();

		console.log('Please wait loading info into database may take some time.');
		// Could wrap in try catch and remove infos.Item if failed load for some error in structure etc/
		var NPCS = new GameInfoLoader('005_00006.IMG',
			restruct.
		        int32lu("_id"). // 0
		        string("Name",28). // 4
		        int32lu("Clan").
		        int32lu("Unknown2").
		        int32lu("Unknown3").
		        int32lu("Unknown4").
		        int32lu("Unknown5").
		        int32lu("Unknown6").
		        int32lu("Unknown7").
		        int32lu("Unknown8").
		        int32lu("Unknown9").
		        int32lu("Unknown10").
		        int32lu("Unknown11").
		        int32lu("Unknown12").
		        int32lu("Unknown13").
		        int32lu("Unknown14").
		        int32lu("Unknown15").
		        int32lu("Unknown16").
		        int32lu("Unknown17").
		        int32lu("PageCount").
		        string("Chat1", 51).
		        string("Chat2", 51).
		        string("Chat3", 51).
		        string("Chat4", 51).
		        string("Chat5", 51).
		        int32lu("Unknown18").
		        int32lu("Unknown19").
		        int32lu("Unknown20").
		        int32lu("Unknown21").
		        int32lu("Unknown22").
		        int32lu("Unknown23").
		        int32lu("Unknown24").
		        int32lu("Unknown25").
		        int32lu("Unknown26").
		        int32lu("Unknown27").
		        int32lu("Unknown28").
		        int32lu("Unknown29").
		        int32lu("Unknown30").
		        int32lu("Unknown31").
		        int32lu("Unknown32").
		        int32lu("Unknown33").
		        int32lu("Unknown34").
		        int32lu("Unknown35").
		        int32lu("Unknown36").
		        int32lu("Unknown37").
		        int32lu("Unknown38").
		        int32lu("Unknown39").
		        int32lu("Unknown40").
		        int32lu("Unknown41").
		        int32lu("Unknown42").
		        int32lu("Unknown43").
		        int32lu("Unknown44").
		        int32lu("Unknown45").
		        int32lu("Unknown46").
		        int32lu("Unknown47").
		        int32lu("Unknown48").
		        int32lu("Unknown49").
		        int32lu("Unknown50").
		        int32lu("Unknown51").
		        int32lu("Unknown52").
		        int32lu("Unknown53").
		        int32lu("Unknown54").
		        int32lu("Unknown55").
		        int32lu("Unknown56").
		        int32lu("Unknown57").
		        int32lu("Unknown58").
		        int32lu("Unknown59").
		        int32lu("Unknown60").
		        int32lu("Unknown61").
		        int32lu("Unknown62").
		        int32lu("Unknown63").
		        int32lu("Unknown64").
		        int32lu("Unknown65").
		        int32lu("Unknown66").
		        int32lu("Unknown67").
		        int32lu("Unknown68").
		        int32lu("Unknown69").
		        int32lu("Unknown70").
		        int32lu("Unknown71").
		        int32lu("Unknown72").
		        int32lu("Unknown73").
		        int32lu("Unknown74").
		        int32lu("Unknown75").
		        int32lu("Unknown76").
		        int32lu("Unknown77").
		        int32lu("Unknown78").
		        int32lu("Unknown79").
		        int32lu("Unknown80").
		        int32lu("Unknown81").
		        int32lu("Unknown82").
		        int32lu("Unknown83").
		        int32lu("Unknown84").
		        int32lu("Unknown85").
		        int32lu("Unknown86").
		        int32lu("Unknown87").
		        int32lu("Unknown88").
		        int32lu("Unknown89").
		        int32lu("Unknown90").
		        int32lu("Unknown91").
		        int32lu("Unknown92").
		        int32lu("Unknown93").
		        int32lu("Unknown94").
		        int32lu("Unknown95").
		        int32lu("Unknown96").
		        int32lu("Unknown97").
		        int32lu("Unknown98").
		        int32lu("Unknown99").
		        int32lu("Unknown100").
		        int32lu("Unknown101").
		        int32lu("Unknown102").
		        int32lu("Unknown103").
		        int32lu("Unknown104").
		        int32lu("Unknown105").
		        int32lu("Unknown106").
		        int32lu("Unknown107").
		        int32lu("Unknown108").
		        int32lu("Unknown109").
		        int32lu("Unknown110").
		        int32lu("Unknown111").
		        int32lu("Unknown112").
		        int32lu("Unknown113").
		        int32lu("Unknown114").
		        int32lu("Unknown115").
		        int32lu("Unknown116").
		        int32lu("Unknown117").
		        int32lu("Unknown118").
		        int32lu("Unknown119").
		        int32lu("Unknown120").
		        int32lu("Unknown121").
		        int32lu("Unknown122").
		        int32lu("Unknown123").
		        int32lu("Unknown124").
		        int32lu("Unknown125").
		        int32lu("Unknown126").
		        int32lu("Unknown127").
		        int32lu("Unknown128").
		        int32lu("Unknown129").
		        int32lu("Unknown130").
		        int32lu("Unknown131").
		        int32lu("Unknown132").
		        int32lu("Unknown133").
		        int32lu("Unknown134").
		        int32lu("Unknown135").
		        int32lu("Unknown136").
		        int32lu("Unknown137").
		        int32lu("Unknown138").
		        int32lu("Unknown139").
		        int32lu("Unknown140").
		        int32lu("Unknown141").
		        int32lu("Unknown142").
		        int32lu("Unknown143").
		        int32lu("Unknown144").
		        int32lu("Unknown145").
		        int32lu("Unknown146").
		        int32lu("Unknown147").
		        int32lu("Unknown148").
		        int32lu("Unknown149").
		        int32lu("Unknown150").
		        int32lu("Unknown151").
		        int32lu("Unknown152").
		        int32lu("Unknown153").
		        int32lu("Unknown154").
		        int32lu("Unknown155").
		        int32lu("Unknown156").
		        int32lu("Unknown157").
		        int32lu("Unknown158").
		        int32lu("Unknown159").
		        int32lu("Unknown160").
		        int32lu("Unknown161").
		        int32lu("Unknown162").
		        int32lu("Unknown163").
		        int32lu("Unknown164").
		        int32lu("Unknown165").
		        int32lu("Unknown166").
		        int32lu("Unknown167").
		        int32lu("Unknown168").
		        int32lu("Unknown169").
		        int32lu("Unknown170").
		        int32lu("Unknown171").
		        int32lu("Unknown172").
		        int32lu("Unknown173").
		        int32lu("Unknown174").
		        int32lu("Unknown175").
		        int32lu("Unknown176").
		        int32lu("Unknown177").
		        int32lu("Unknown178").
		        int32lu("Unknown179").
		        int32lu("Unknown180").
		        int32lu("Unknown181").
		        int32lu("Unknown182").
		        int32lu("Unknown183").
		        int32lu("Unknown184").
		        int32lu("Unknown185").
		        int32lu("Unknown186").
		        int32lu("Unknown187").
		        int32lu("Unknown188").
		        int32lu("Unknown189").
		        int32lu("Unknown190").
		        int32lu("Unknown191").
		        int32lu("Unknown192").
		        int32lu("Unknown193").
		        int32lu("Unknown194").
		        int32lu("Unknown195").
		        int32lu("Unknown196").
		        int32lu("Unknown197").
		        int32lu("Unknown198").
		        int32lu("Unknown199").
		        int32lu("Unknown200").
		        int32lu("Unknown201").
		        int32lu("Unknown202").
		        int32lu("Unknown203").
		        int32lu("Unknown204").
		        int32lu("Unknown205").
		        int32lu("Unknown206").
		        int32lu("Unknown207").
		        int32lu("Unknown208").
		        int32lu("Unknown209").
		        int32lu("Unknown210").
		        int32lu("Unknown211").
		        int32lu("Unknown212").
		        int32lu("Unknown213").
		        int32lu("Unknown214").
		        int32lu("Unknown215").
		        int32lu("Unknown216").
		        int32lu("Unknown217").
		        int32lu("Unknown218").
		        int32lu("Unknown219").
		        int32lu("Unknown220").
		        int32lu("Unknown221").
		        int32lu("Unknown222").
		        int32lu("Unknown223").
		        int32lu("Unknown224").
		        int32lu("Unknown225").
		        int32lu("Unknown226").
		        int32lu("Unknown227").
		        int32lu("Unknown228").
		        int32lu("Unknown229").
		        int32lu("Unknown230").
		        int32lu("Unknown231").
		        int32lu("Unknown232").
		        int32lu("Unknown233").
		        int32lu("Unknown234").
		        int32lu("Unknown235").
		        int32lu("Unknown236").
		        int32lu("Unknown237").
		        int32lu("Unknown238").
		        int32lu("Unknown239").
		        int32lu("Unknown240").
		        int32lu("Unknown241").
		        int32lu("Unknown242").
		        int32lu("Unknown243").
		        int32lu("Unknown244").
		        int32lu("Unknown245").
		        int32lu("Unknown246").
		        int32lu("Unknown247").
		        int32lu("Unknown248").
		        int32lu("Unknown249").
		        int32lu("Unknown250").
		        int32lu("Unknown251").
		        int32lu("Unknown252").
		        int32lu("Unknown253").
		        int32lu("Unknown254").
		        int32lu("Unknown255").
		        int32lu("Unknown256").
		        int32lu("Unknown257").
		        int32lu("Unknown258").
		        int32lu("Unknown259").
		        int32lu("Unknown260").
		        int32lu("Unknown261").
		        int32lu("Unknown262").
		        int32lu("Unknown263").
		        int32lu("Unknown264").
		        int32lu("Unknown265").
		        int32lu("Unknown266").
		        int32lu("Unknown267").
		        int32lu("Unknown268").
		        int32lu("Unknown269").
		        int32lu("Unknown270").
		        int32lu("Unknown271").
		        int32lu("Unknown272").
		        int32lu("Unknown273").
		        int32lu("Unknown274").
		        int32lu("Unknown275").
		        int32lu("Unknown276").
		        int32lu("Unknown277").
		        int32lu("HealthMax").
		        int32lu("Entrance").
		        int32lu("Teach").
		        int32lu("Storage").
		        int32lu("MakeGuild").
		        int32lu("Trade").
		        int32lu("Refine").
		        int32lu("Craft").
		        int32lu("Move").
		        int32lu("Bank").
		        int32lu("Enchant").
		        int32lu("Refill").
		        int32lu("Antique").
		        int32lu("ResetStat").
		        int32lu("ExpGuild").
		        int32lu("CombineScrolls").
		        int32lu("JoinBattle").
		        int32lu("Leave").
		        int32lu("Upgrade").
		        int32lu("PlaceBet").
		        int32lu("Move2").
		        int32lu("Buy").
		        int32lu("Extract").
		        int32lu("ListItems").
		        int32lu("Unknown01").
		        int32lu("Withdraw").
		        int32lu("DownGrade").
		        int32lu("CombineItems").
		        int32lu("DiceMatch").
		        int32lu("Leader").
		        int32lu("Gift").
		        int32lu("Reward").
		        int32lu("Exchange").
		        int32lu("Track").
		        int32lu("Isolation").
		        int32lu("Convert").
		        int32lu("Unknown278").
		        int32lu("Unknown279").
		        int32lu("Unknown280").
		        int32lu("CraftWeapon").
		        int32lu("CraftArmor").
		        int32lu("Buff").
		        int32lu("Unknown281").
		        int32lu("ConvertCP").
		        int32lu("Unknown282").
		        int32lu("Unknown283").
		        int32lu("Unknown284").
		        int32lu("CombinePet").
		        int32lu("Unknown285").
		        int32lu("Unknown286").
		        int32lu("ENDOFLIST").
		        int32lu("Unknown287").
		        int8lu("Unk1").
		        int32lu("Items", 168). // TODO: Work out NPC items for their shops in a nicer format
		        int8lu("Unk3", 3).
		        int32lu("Shift8Bytes", 2).
		        string("CellFile", 6025),
			  function onRecordLoad(record) {
			  	if (record._id) {
			  		record.Name = encoding.convert(record.Name, 'UTF-8', 'EUC-KR').toString();
			  		console.log(record._id, record.Name);
			  		record.Chat1 = encoding.convert(record.Chat1, 'UTF-8', 'EUC-KR').toString();
			  		record.Chat2 = encoding.convert(record.Chat2, 'UTF-8', 'EUC-KR').toString();
			  		record.Chat3 = encoding.convert(record.Chat3, 'UTF-8', 'EUC-KR').toString();
					record.Chat4 = encoding.convert(record.Chat4, 'UTF-8', 'EUC-KR').toString();
			  		record.Chat5 = encoding.convert(record.Chat5, 'UTF-8', 'EUC-KR').toString();
			  		db.NPC.create(record, function(err, doc) {
			  			if (err) {
			  				console.error(err);
			  				return;
			  			}

			  			console.log('Confirming save of '+doc._id);
			  		});
			  	}
			  }
			);

		NPCS.once('loaded', function(){
			done(true);
		});

  	});

	vmscript.watch('Config/world.json');
  });
};
