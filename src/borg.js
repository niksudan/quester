var borg = {
	name: 'borg',
	mention: false,
	responses: [
		[/\binvite\b/i, 'debug', 'invite'],
		[/\bhelp\b/i, 'debug', 'help'],
		[/\bstart\b/i, 'quester', 'start'],
		[/\bstatus\b/i, 'quester', 'status'],
		[/\bperform (.*)\b/, 'quester', 'perform'],
		[/\bsay (.*)\b/, 'quester', 'say'],
		[/\bgames\b/, 'quester', 'gameCount'],
		[/\bend\b/, 'quester', 'gameover']
	],
	
	handle: function(message, response, user, channelID)
	{
		var responded = false;
		for (var i = 0; i < this.responses.length; i++) {
			if (!responded && message.match(this.responses[i][0])) {
				if (borg.mention && message.indexOf(borg.mention) > -1) {
					responded = true;
					this[this.responses[i][1]][this.responses[i][2]](response, channelID, message, user, this.responses[i][0]);
					break;
				}
			}
		}
	},
	
	debug: require('./debug.js'),
	quester: require('./quester.js'),
};

module.exports = borg;