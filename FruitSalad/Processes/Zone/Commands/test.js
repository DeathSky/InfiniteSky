// Tests out attacking.
// GMCommands.AddCommand(new Command('t',60,function command_test(string, client){
// 	var attackInfo = { actionValue: 1, Status: 0 };
// 	processAttack(attackInfo, client.character.state, client.character.state.target_id);
// 	console.log(attackInfo);
//
//
// 	attackInfo.AttackerID = client.character.state.CharacterID;
// 	// Have to see about sending NodeID as well in the action packet.
// 	//attackInfo.AttackerIndex = client.character.state.NodeID;
// 	attackInfo.DefenderID = client.character.state.CharacterID;
// 	//attackInfo.DefenderIndex = 1;
// 	attackInfo.TotalDamage = attackInfo.Damage;
// 	attackInfo.DamageHP = attackInfo.Damage;
//
// 	// TODO: Send attack packet to target location.
// 	Zone.sendToAllArea(
// 		client, true,
// 		packets.makeCompressedPacket(0x2C, new Buffer(Zone.send.attack.pack(attackInfo))),
// 		config.viewable_action_distance);
// }));

GMCommands.AddCommand(new Command('info',60,function command_info(string, client){
	client.character.infos = new CharacterInfos(client);
	client.character.infos.updateAll(function(){
		client.character.infos.print();
	});
	// console.log(client.character.infos.print());
}));


GMCommands.AddCommand(new Command('indexes',60,function command_indexes(string, client){
	client.sendInfoMessage('AccountID: '+client.character.state.AccountID);
	client.sendInfoMessage('CharacterID: '+client.character.state.CharacterID);
	client.sendInfoMessage('NodeID: '+client.character.state.NodeID);
    
}));


// Use the packet id 0x2C
// Zone.send.attack = restruct.
//     int32lu('Action'). // 0 your attacking
//     int32lu('AttackerID').
//     int32lu('AttackerIndex').
//     int32lu('DefenderID').
//     int32lu('DefenderIndex').
//     int32lu('A'). // Skill ID?
//     int32lu('B').
//     int32lu('C').
//     int32lu('D').
//     int32lu('Status'). // Depends on attacker or defender | hit or miss, block or not |
//     int32lu('TotalDamage').
//     int16lu('Deadly').
//     int16lu('ElementalDamage', 3).
//     // int16lu('Shadow').
//     // int16lu('Dark').
//     int32ls('DamageHP');


// Zone.recv.attack = restruct.
//     int8lu('PacketID').
//     int8lu('Status').
//     int32lu('Action').
//     int32lu('CharID1').
//     int32lu('CharID2').
//     int32lu('TargetID').
//     int32lu('nodeID').
//     int32lu('skillID').
//     int8lu('Unk', 40);

// Modes of attack:
// 1 Player VS Player
// 2 Player VS Enemy Faction Player
// 3 Player VS Monster
// 4 Monster VS Player
// 5? Player VS NPC
// 6? NPC VS Player

//rpc.api.callOn('*','addNumbers',[100,200]);

function processAttack(attackInfo, attacker, target) {
	console.log('DexHitRate: '+attacker.infos.DexHitRate);
	console.log('DexDodge: '+attacker.infos.DexDodge);
	console.log('Damage: '+attacker.infos.Damage);
	console.log('Dodge: '+attacker.infos.Dodge);
	console.log('Defense: '+attacker.infos.Defense);
	console.log('HitRate: '+attacker.infos.HitRate);
	console.log('ElementalDamage: '+attacker.infos.ElementalDamage);
	console.log('DeadlyRate: '+attacker.infos.DeadlyRate);

	// TODO Conditionals to break out.
	// if user does not match detail in packet
	// if target cannot be found
	// if player is dead
	// if (attacker.getHealth() <= 0) return;
	// if target is out of range
	// if (player.location.distance(target.location) > 30) return;
	// if the location in the attack packet is impossible to get to. / speed and teleport hack detection
	// if target is dead
	// if (target.getHealth() <= 0) return;
	// if target is in the apShop? if target has shop open?
	// if (target.inAPShop) return;
	// if player is stunned/unable to attack
	// if (player.isStunned()) return;
	// if target has attack protection timer
	// if (target.isProtected()) return;
	// if player is undergoing zone change
	// if (player.changingZone) return;
	// if target is undergoing zone change
	// if (target.changingZone) return;
	// if target has godmode (from a gm command)
	// if (target.invincible) return;
	// if target is a not a possible target
	// if player is in a duel and target is not opponent
	// if (player.duel && target.id !== player.duel_target_id) return false;
	// if target is in a duel and their combatant is not player
	// if (target.duel && player.id !== target.duel_target_id) return false;

	// Set the character location to the place int he attack action packet

    // Do a broadcast of action, handle charging skills?
    //TEST
    target = {
    	attack_block: 1,
    	Defense: 1,
    	CharacterID: 0
    };
    attackInfo.Status = 0;
    // Get attack success chance
    var attack_success = 0;
    switch (attackInfo.actionValue) {
    	case 1: // Normal Attack?
    		attack_success = attacker.infos.HitRate;
    	break;
    	case 2: // Skill Attack?
			// I am not sure. Something like if skill using is not one they previous charged?
			// And a limit against spamming attacks?
			attack_success = attacker.infos.HitRate;
    	break;
    	default:
    	return;
    }

    if (attack_success < 1) {
    	// Should miss/fail
    	return;
    }

    // Get attack block chance
    var attack_chance = 0;
    var block_value = target.attack_block;
	if (block_value > 0) {
		if (attack_success > block_value) { // Maybe we don't need to floor these?
			// Cap it to 99 as a min
			attack_chance = Math.min(70 + ((attack_success / block_value) - 1) * 25, 99);
		} else {
			// Cap it to 1 as a max
			attack_chance = Math.max(70 - ((block_value / attack_success) - 1) * 25, 1);
		}
	}

	// Do a random for attack chance inclusive
	if (random.real(0, 100, true) >= attack_chance) {
		return;
	} else {
		attackInfo.Status = 1;
	}

	// Get attack power
	var attackPower = attacker.infos.Damage;

	// TODO: Skill attack power
	// Get the ratio to increase attack power by for the skill in use.

	attackPower = Math.max(attackPower - target.Defense, 1);

	// TODO: Increase attack power based on charged up attack value.

	// Work out a random increase or decrease of attackPower of 11% either way
	if (random.bool()) {
		attackPower += Math.floor(attackPower * random.real(0, 0.11));
	} else {
		attackPower -= Math.floor(attackPower * random.real(0, 0.11));
	}

	var MINDAMAGEPOSSIBLE = 5;
	if (attackPower < MINDAMAGEPOSSIBLE) // Minimum possible damage
	{
		attackPower = MINDAMAGEPOSSIBLE;
	}
	// if( tDamageValue < tMinDamageValueWithAvatar )
	// {
	// 	tDamageValue = tMinDamageValueWithAvatar;
	// }

	// Get deadly value if possible
	attackInfo.Deadly = 0;
	switch (attackInfo.actionValue) {
		case 1:
			if (random.real(0, 100, true) < getDeadlyChance( attacker, target ) ) {
				attackInfo.Deadly = 1;
				attackPower *= 2;
			}
		break;
		case 2:
			// Handle deadly for skills?
			// Get skill attack type
			// if 2 or 5? then do deadly.
			// if (random.real(0, 100, true) < getDeadlyChance( attacker, target ) ) {
			// 	attackInfo.Deadly = 1;
			// 	attackPower *= 2;
			// }
		break;
	}

	if (target.CharacterID !== undefined) {
		// Players do 5x less damage to other players?
		attackPower /= MINDAMAGEPOSSIBLE;
	}

	// TODO: Effects on players.
	// Reverse of damage etc.
	// Sheilding Damage
	// Splash damage?

	// TODO: Elemental Damage


	attackInfo.Damage = attackPower;
}

function getDeadlyChance(attacker, target) {
	// Get attacker deadly rate
	// TODO: If there is skill to increase deadly/buff then handle it here/
	var deadly_rate = attacker.infos.DeadlyRate || 0;

	// TODO: if there is a skill/buff for deadly dodge handle it here.
	// Get target deadly defense
	// Monsters & NPC have no deadly dodge rate
	var deadly_dodge = target.infos.DeadlyDodgeRate || 0

	if (deadly_rate > deadly_dodge)
	{
		deadly_rate -= deadly_dodge;
	}
	return deadly_rate;
}

function getDeathPosition(attacker, target) {
	// 2D
	// Get distance between them
	var deltaX = target.location.x - attacker.location.x;
	var deltaY = target.location.y - attacker.location.y;
	var length = Math.sqrt( deltaX * deltaX + deltaY * deltaY );

	// Prevent division by zero
	if (length < 1) {
		deltaX = 0;
		deltaY = 0;
	} else {
		deltaX /= length;
		deltaY /= length;
	}

	// set action on target to dieing
	// set their target location x and y to the delta x and delta y.
	// Set their direction to away?



}

 // 'clan',
 // 'Pet',
 // 'Outfit',
 // 'Modifiers',     [ 'HP', 'Chi', 'HitRate', 'Dodge', 'Damage' ]
 // 'Weapon',   { Damage: 4,
			  // Mod: 3.8599999,
			  // HitRate: 1,
			  // ElementalDamage: 0,
			  // Skills: {},
			  // AllSkills: 0 }
 // 'Boots',
 // 'Ring',
 // 'Gloves',
 // 'Cape',
 // 'Amulet',
 // 'DexHitRate',
 // 'DexDodge',
 // 'Damage',
 // 'Dodge',
 // 'Defense',
 // 'HitRate',
 // 'MaxHP',
 // 'MaxChi',
 // 'ElementalDamage'
 // 'Resists',
 // 'Luck',
 // 'DeadlyRate',
 // 'Skills',
 // 'AllSkills' ]
