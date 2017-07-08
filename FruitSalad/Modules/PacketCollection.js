// This file is part of InfiniteSky.
// Copyright (c) InfiniteSky Dev Teams - Licensed under GNU GPL
// For more information, see LICENCE in the main folder

var fs = require('fs');
var vm = require('vm');
var util = require('./util');

/**
 * NOP function
 * @param  {buffer} data The packet data.
 */
function defaultPacketFunction(data) {

}

/**
 * PacketCollection is our way of storing which packet id's have which structure and which function to handle them with.
 * @param {String} PacketCollectionName Name of the collection
 * @exports PacketCollection
 * @example
 * 
// Use Set to add a packet to the collection
// Usage:
// var p = new PacketCollection();

// // When packet is just packet id no data
// p.Set(0x00,{ function: function _Packet_00() {
// 	// Do something
// } });


// // When packet is going to use restruct/structure
// // Should use 
// p.Set(0x01,{
// 	Restruct: restruct.
// 		string('Name', 20).
// 		int32lu('Age'),
// 	function: function _Packet_01(p) {
// 	// Do something with p
// 	console.log(p.Name+' is '+p.Age+' years old.');

// } });

// // When packet is a id and size without restruct
// p.Set(0x02,{
// 	Size: 10, function: funciton _Packet_02(data) {
// 		// data will be a buffer with size of 10 bytes.
// 		console.log(data.toString());
// 	}
// });

// // If you don't know the function or data structure yet and just want to add it for starts so server dosnt complain.
// p.Set(0x03,{Size: 50});

 */
function PacketCollection(PacketCollectionName) {
	this.LastAdded = null;

	global[PacketCollectionName] = this;

	this.Packets = {};
	return this;
};

/**
 * Gets a PacketCollection info for a PacketID.
 * @param {Integer} id The PacketID to look up.
 * @returns {object|null} The PacketInfo object.
 */
PacketCollection.prototype.Get = function(id){
	return this.Packets[id] || null;
}

/**
 * Sets a PacketCollection info for a PacketID.
 * @param {Integer} id The PacketID.
 * @param {object} id The PacketInfo object.
 */
PacketCollection.prototype.Set = function(id, opts){
	var p = {ID: id, function: defaultPacketFunction};
	
	if (opts) {
		if (opts.function) p.function = opts.function;
		if (opts.Restruct) p.Restruct = opts.Restruct;
		if (opts.Size) p.Size = opts.Size;
	}

	this.Packets[id] = p;

	this.LastAdded = id;
}

/**
 * Removes a packet from the collection by ID.
 * @param {Integer} id The packetID to remove.
 */
PacketCollection.prototype.Remove = function(id) {
	delete this.Packets[id];
}

module.exports = PacketCollection;

// TODO: Code in a way to have a variable packet size bassed on the packet data or some other value/function.
// 
// p.Set(0x00,{Sizefunction: function(data) {
// 	// data is access to buffer from the byte after packet id to end as much as we have recieved
// 	if (data.length>4) { // If room for packet size + data
// 		return  data.readUInt(0);
// 	}
// 	return null;
// }, function: function Custom_Packet(data) {
// 	// Do stuff with our chunk of data...
// }};