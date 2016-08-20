var borg = require('./src/borg');
var config = require('./config');
var Discord = require('discord.io');

borg.name = config.name;
borg.mention = '<@' + config.id + '>';

var bot = new Discord.Client({
	autorun: true,
	token: config.token
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
	if (userID != config.id) {
		borg.handle(message, function(response)
		{
			var message = '<@' + userID + '>: ' + response;
			var message = response;
			bot.sendMessage({to: channelID, message: message});
			console.log('[' + config.name + ' @ ' + channelID + ']: ' + message);
		}, user, channelID);
	}
});