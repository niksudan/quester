
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

var games = [];

var getGame = function(channelID) {
	return games['#' + channelID];
}

var deleteGame = function(channelID) {
	delete games['#' + channelID];
}

var quester = {
	
	gameCount: function(response)
	{
		var str = '';
		str += ':european_castle: There are currently **' + Object.keys(games).length + '** adventurer(s)!';
		Object.keys(games).forEach(function(i) {
			var game = games[i];
			str += '\n**' + game.hero.name + '**, venturing through the ' + game.dungeon.name + ' with **' + game.kills +  '** kill(s)';
		});
		response(str);
	},
	
	newGame: function(channelID)
	{
		games['#' + channelID] = { 
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
		};
	},
	
	// Start a new quest
	start: function(response, channelID, message, user, regex)
	{
		var self = this;
		if (getGame(channelID)) {
			response(':warning: A game has already begun!');
		} else {
			self.newGame(channelID);
			getGame(channelID).started = true;
			getGame(channelID).hero.name = user + ', the ' + getAdj() + ' ' + getNoun();
			response(':wave: Hail **' + getGame(channelID).hero.name + '**!');
			
			setTimeout(function() {
				getGame(channelID).dungeon.name = 'Dungeon of ' + getAdj() + ' ' + getNoun();
				response(':european_castle: Your ' + getAdj() + ' quest begins on this ' + getAdj() + ' day. You ' + getVerb().present + ' from a ' + getNoun() + ' and into the **' + getGame(channelID).dungeon.name + '**...');
			}, 1000);
			
			setTimeout(function() {
				self.newRoom(response, channelID);
			}, 3000);
		}
	},
	
	// Return the hero's status
	status: function(response, channelID, message, user, regex)
	{
		var self = this;
		if (!getGame(channelID)) {
			response(':warning: An adventure has not started!');
		} else {
			var str = '**:walking: ' + getGame(channelID).hero.name + '** [HP: ' + getGame(channelID).hero.health + ']';
			if (getGame(channelID).creature.name != '') {
				str += '\n** :boar: The ' + getGame(channelID).creature.name + '** [HP: ' + getGame(channelID).creature.health + ']';
			}
			response(str);
		}
	},
	
	// Process gameover
	gameover: function(response, channelID, message, user, regex)
	{
		var self = this;
		if (!getGame(channelID)) {
			response(':warning: An adventure has not started!');
		} else {
			getGame(channelID).started = false;
			response('** :skull: Rest in peace, ' + getGame(channelID).hero.name + ' :skull: **\n\n**' + getGame(channelID).dungeon.name + '**\nRooms Traversed: ' + getGame(channelID).rooms + '\nCreatures Killed: ' + getGame(channelID).kills);
			deleteGame(channelID);
		}
	},
	
	// Process a new room
	newRoom: function(response, channelID)
	{
		var self = this;
		if (getGame(channelID)) {
			getGame(channelID).rooms += 1;
			getGame(channelID).dungeon.currentRoom = getAdj() + ' ' + getNoun();
			response(':runner: You ' + getVerb().present + ' into a ' + getGame(channelID).dungeon.currentRoom + '...');
			
			setTimeout(function() {
				getGame(channelID).dungeon.currentType = choose(['encounter']);
				switch (getGame(channelID).dungeon.currentType) {
					
					// Creature encounter
					case 'encounter':
						getGame(channelID).creature.name = getAdj() + ' ' + getNoun();
						getGame(channelID).creature.health = choose([1, 2, 3, 3, 3, 3, 4, 4, 5]);
						response(':boar: A **' + getGame(channelID).creature.name + '** ' + pluralize(getVerb().present) + ' at you' + choose(['!', '!!', '?', '...', '.', '?!']) + ' What will you do?');
						getGame(channelID).canPerform = true;
						break;
				};
			}, 1000);
		}
	},
	
	// Perform an action
	perform: function(response, channelID, message, user, regex)
	{
		var self = this;
		if (!getGame(channelID)) {
			response(':warning: An adventure has not started!');
		} else if (getGame(channelID).canPerform) {
			getGame(channelID).canPerform = false;
			var match = message.match(regex);
			var action = match[1];
			
			// Process damage
			setTimeout(function() {
				switch (choose([true, true, true, false])) {
					case false:
						response(choose([
							':crossed_swords: Your ' + action + ' missed' + choose(['!', '!!', '?', '...', '.', '?!']),
							':crossed_swords: The ' + getGame(channelID).creature.name + choose([' resisted', ' was immune to', ' dodged', ' was not affected by']) + ' your ' + action + choose(['!', '!!', '?', '...', '.', '?!'])
						]));
						break;
					case true:
					var damage = choose([1, 1, 1, 1, 2, 2, 2, 3]);
					getGame(channelID).creature.health -= damage;
						response(':crossed_swords: You ' + action + ' the ' + getGame(channelID).creature.name + ' ' + getAdverb() + ' for **' + damage + ' damage**' + choose(['!', '!!', '?', '...', '.', '?!']));
						break;
				}
			}, 1000);
			
			// Process aftermath
			setTimeout(function() {
				if (getGame(channelID).creature.health <= 0) {
					getGame(channelID).kills += 1;
					response(':trophy: You defeated the ' + getGame(channelID).creature.name + choose(['!', '!!', '?', '...', '.', '?!']));
					setTimeout(function() {
						getGame(channelID).creature.name = '';
						self.newRoom(response, channelID);
					}, 2000);
				} else {
					switch (choose([false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true])) {
						case false:
							switch (choose([true, true, true, false])) {
								case true:
									var damage = choose([1, 1, 1, 1, 1, 2, 2]);
									getGame(channelID).hero.health -= damage;
									if (getGame(channelID).hero.health <= 0) {
										response(':crossed_swords: The ' + getGame(channelID).creature.name + ' ' + pluralize(getVerb().present) + ' at you, dealing **' + damage + ' damage**, and kills you in the process! **You have died!**');
										setTimeout(function() {
											self.gameover(response, channelID);
										}, 1000);
									} else {
										response(':crossed_swords: The ' + getGame(channelID).creature.name + ' ' + pluralize(getVerb().present) + ' at you, dealing **' + damage + ' damage**' + choose(['!', '!!', '?', '...', '.', '?!']) + ' What will you do now?');
										getGame(channelID).canPerform = true;
									}
									break;
								case false:
									response(':crossed_swords: The ' + getGame(channelID).creature.name + ' tried to ' + getVerb().present + ' at you, but ' + choose([
										'it missed',
										'you dodged it',
										'you were immune',
										'it didn\'t affect you',
										'it did nothing'
									]) + choose(['!', '!!', '?', '...', '.', '?!']) + ' What will you do now?');
									getGame(channelID).canPerform = true;
									break;
							}
							break;
						case true:
							response(':dash: The ' + getGame(channelID).creature.name + ' **fled** from the ' + getGame(channelID).dungeon.currentRoom + choose(['!', '!!', '?', '...', '.', '?!']));
							setTimeout(function() {
								self.newRoom(response, channelID);
							}, 2000);
							break;
					}
				}
			}, 2000);
		}
	},
	
	// Say something
	say: function(response, channelID, message, user, regex)
	{
	var self = this;
		if (!getGame(channelID)) {
			response(':warning: An adventure has not started!');
		} else if (getGame(channelID).canPerform) {
			getGame(channelID).canPerform = false;
			var match = message.match(regex);
			var phrase = match[1];
			
			// Process speech
			response(':sound: You ' + choose([
				'scream',
				'shout',
				'exclaim',
				'say',
				'whisper',
			]) + ' **"' + phrase + '"**' + choose(['!', '!!', '?', '...', '.', '?!']));
			
			// Process reaction
			var action = choose(['nothing', 'nothing', 'nothing', 'speak', 'speak', 'hurt', 'hurt', 'hurt', 'heal', 'damage', 'damage']);
			setTimeout(function() {
				str = '';
				switch (action) {
					case 'nothing':
						str = ':mute: The ' + getGame(channelID).creature.name + ' ' + choose([
							'didn\'t do anything',
							'couldn\'t hear you',
							'covered its ears',
							'didn\'t understand you',
							'just looked at you weirdly'
						]) + choose(['!', '!!', '?', '...', '.', '?!']);
						break;
					case 'speak':
						str = ':sound: The ' + getGame(channelID).creature.name + ' ' + choose([
							'responds with',
							'replies with',
							'says back',
							'screams back',
							'whispers back',
							'exclaims back'
						]) + ' **"' + choose ([
							getVerb().present + ' ' + choose(['my', 'your', 'the']) + ' ' + getNoun() + ' ' + getAdverb()
						]) + '"** ' + choose(['!', '!!', '?', '...', '.', '?!']);
						break;
					case 'heal':
						var recovery = choose([1, 1, 1, 1, 2, 2, 2, 3]);
						getGame(channelID).hero.health += recovery;
						str = ':sparkling_heart: The ' + getGame(channelID).creature.name + ' ' + choose([
							'appreciates',
							'likes',
							'loves',
							'enjoys',
							'laughs at',
							'smiles at',
							'grins at',
							'really likes',
						]) + ' what you said and ' + getAdverb() + ' heals you for **' + recovery +  ' health**' + choose(['!', '!!', '?', '...', '.', '?!']);
						break;
					case 'damage':
						var damage = choose([1, 1, 1, 1, 2, 2, 2, 3]);
						getGame(channelID).creature.health -= damage;
						str = ':crossed_swords: The ' + getGame(channelID).creature.name + ' is ' + getAdverb() + ' hurt for **' + damage +  ' damage**' + choose(['!', '!!', '?', '...', '.', '?!']);
						break;
					case 'hurt':
						var damage = choose([1, 1, 1, 1, 2, 2, 2, 3]);
						getGame(channelID).hero.health -= damage;
						str = ':crossed_swords: The ' + getGame(channelID).creature.name + ' ' + choose([
							'takes offense',
							'gets annoyed',
							'ignores you',
							'couldn\'t understand you',
							'didn\'t hear you'
						]) + ' and ' + getAdverb() + ' hurts you for **' + damage +  ' damage**' + choose(['!', '!!', '?', '...', '.', '?!']);
						break;
				}
				
				// Handle creature defeat
				if (getGame(channelID).creature.health <= 0) {
					response(str);
					setTimeout(function() {
						getGame(channelID).kills += 1;
						response(':trophy: You defeated the ' + getGame(channelID).creature.name + choose(['!', '!!', '?', '...', '.', '?!']));
						setTimeout(function() {
							self.newRoom(response, channelID);
						}, 2000);
					}, 1000);
					getGame(channelID).creature.name = '';
					
				// Handle player death
				} else if (getGame(channelID).hero.health <= 0) {
					str += ' It kills you! **You have died!**';
					response(str);
					setTimeout(function() {
						self.gameover(response, channelID);
					}, 1000);
					
				// Everything else
				} else {
					str += ' What will you do now?';
					response(str);
					getGame(channelID).canPerform = true;
				}
				
			}, 1000);
			
		}
	}
};

module.exports = quester;