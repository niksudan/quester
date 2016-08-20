var pluralize = require('pluralize');

var choose = function(array) {
	return array[Math.floor(Math.random() * array.length)];
}

var nouns = require('../data/nouns.json');
var verbs = require('../data/verbs.json');
var adjs = require('../data/adjs.json');
var adverbs = require('../data/adverbs.json');

var getNoun = function() {
	return choose(nouns.nouns);
}

var getVerb = function() {
	return choose(verbs.verbs);
}

var getAdj = function() {
	return choose(adjs.adjs);
}

var getAdverb = function() {
	return choose(adverbs.adverbs);
}

var quester = {
	started: false,
	canPerform: false,
	kills: 0,
	rooms: 0,
	hero: {
		name: '',
		health: 5
	},
	dungeon: {
		name: '',
		currentRoom: '',
		currentType: '',
	},
	creature: {
		name: '',
		health: 1
	},
	
	// Start a new quest
	start: function(response, message, user)
	{
		var self = this;
		self.started = true;
		self.hero.name = user + ', the ' + getAdj() + ' ' + getNoun();
		response(':wave: Hail **' + this.hero.name + '**!');
		
		setTimeout(function() {
			self.dungeon.name = 'Dungeon of ' + getAdj() + ' ' + getNoun();
			response(':european_castle: Your ' + getAdj() + ' quest begins on this ' + getAdj() + ' day. You ' + getVerb().present + ' from a ' + getNoun() + ' and into the **' + self.dungeon.name + '**...');
		}, 1000);
		
		setTimeout(function() {
			self.newRoom(response);
		}, 3000);
	},
	
	// Return the hero's status
	status: function(response)
	{
		var self = this;
		if (!self.started) {
			response('What are you doing? You haven\'t started an adventure yet!');
		} else {
			response('**:walking: ' + self.hero.name + '**\nHealth: ' + self.hero.health);
			setTimeout(function() {
				if (self.creature.name != '') {
					response('** :boar: The ' + self.creature.name + '**\nHealth: ' + self.creature.health);
				}
			}, 500)
		}
	},
	
	// Process gameover
	gameover: function(response)
	{
		var self = this;
		self.started = false;
		response('** :skull: Rest in peace, ' + self.hero.name + ' :skull: **\n\n**' + self.dungeon.name + '**\nRooms Traversed: ' + self.rooms + '\nCreatures Killed: ' + self.kills);
	},
	
	// Process a new room
	newRoom: function(response)
	{
		var self = this;
		self.rooms += 1;
		self.dungeon.currentRoom = getAdj() + ' ' + getNoun();
		response(':runner: You ' + getVerb().present + ' into a ' + self.dungeon.currentRoom + '...');
		
		setTimeout(function() {
			self.dungeon.currentType = choose(['encounter']);
			switch (self.dungeon.currentType) {
				
				// Creature encounter
				case 'encounter':
					self.creature.name = getAdj() + ' ' + getNoun();
					self.creature.health = choose([1, 2, 3, 3, 3, 3, 4, 4, 5]);
					response(':boar: A **' + self.creature.name + '** ' + pluralize(getVerb().present) + ' at you' + choose(['!', '!!', '?', '...', '.', '?!']) + ' What will you do?');
					self.canPerform = true;
					break;
			};
		}, 1000);
	},
	
	// Perform an action
	perform: function(response, message, user, regex)
	{
		var self = this;
		if (!self.started) {
			response('What are you doing? You haven\'t started an adventure yet!');
		} else if (self.canPerform) {
			self.canPerform = false;
			var match = message.match(regex);
			var action = match[1];
			
			// Process damage
			setTimeout(function() {
				switch (choose([true, true, true, false])) {
					case false:
						response(choose([
							':crossed_swords: Your ' + action + ' missed' + choose(['!', '!!', '?', '...', '.', '?!']),
							':crossed_swords: The ' + self.creature.name + choose([' resisted', ' was immune to', ' dodged', ' was not affected by']) + ' your ' + action + choose(['!', '!!', '?', '...', '.', '?!'])
						]));
						break;
					case true:
					var damage = choose([1, 1, 1, 1, 2, 2, 2, 3]);
					self.creature.health -= damage;
						response(':crossed_swords: Your ' + action + ' ' + getAdverb() + ' ' + pluralize(getVerb().present) + ' the ' + self.creature.name + ' for **' + damage + ' damage**' + choose(['!', '!!', '?', '...', '.', '?!']));
						break;
				}
			}, 1000);
			
			// Process aftermath
			setTimeout(function() {
				if (self.creature.health <= 0) {
					self.kills += 1;
					response(':trophy: You defeated the ' + self.creature.name + choose(['!', '!!', '?', '...', '.', '?!']));
					self.creature.name = '';
					setTimeout(function() {
						self.newRoom(response);
					}, 2000);
				} else {
					switch (choose([false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true])) {
						case false:
							switch (choose([true, true, true, false])) {
								case true:
									var damage = choose([1, 1, 1, 1, 1, 2, 2]);
									self.hero.health -= damage;
									if (self.hero.health <= 0) {
										response(':crossed_swords: The ' + self.creature.name + ' ' + pluralize(getVerb().present) + ' at you, dealing **' + damage + ' damage**, and kills you in the process! **You have died!**');
										setTimeout(function() {
											self.gameover(response);
										}, 1000);
									} else {
										response(':crossed_swords: The ' + self.creature.name + ' ' + pluralize(getVerb().present) + ' at you, dealing **' + damage + ' damage**' + choose(['!', '!!', '?', '...', '.', '?!']) + ' What will you do now?');
										self.canPerform = true;
									}
									break;
								case false:
									response(':crossed_swords: The ' + self.creature.name + ' tried to ' + getVerb().present + ' at you, but ' + choose([
										'it missed',
										'you dodged it',
										'you were immune',
										'it didn\'t affect you',
										'it did nothing'
									]) + choose(['!', '!!', '?', '...', '.', '?!']) + ' What will you do now?');
									self.canPerform = true;
									break;
							}
							break;
						case true:
							response(':dash: The ' + self.creature.name + ' **fled** from the ' + self.dungeon.currentRoom + choose(['!', '!!', '?', '...', '.', '?!']));
							setTimeout(function() {
								self.newRoom(response);
							}, 2000);
							break;
					}
				}
			}, 2000);
		}
	}
};

module.exports = quester;