var borg = {
	name: 'borg',
	mention: false,
	responses: [
		[/\binvite\b/i, 'debug', 'invite'],
		[/\bhelp\b/i, 'debug', 'help'],
		[/\bstart\b/i, 'quester', 'start'],
		[/\bstatus\b/i, 'quester', 'status'],
		[/\bperform ([A-Za-z ]*)\b/, 'quester', 'perform'],
	],
	
	handle: function(message, response, user)
	{
		var responded = false;
		for (var i = 0; i < this.responses.length; i++) {
			if (!responded && message.match(this.responses[i][0])) {
				if (borg.mention && message.indexOf(borg.mention) > -1) {
					responded = true;
					this[this.responses[i][1]][this.responses[i][2]](response, message, user, this.responses[i][0]);
					break;
				}
			}
		}
	},
	
	debug: require('./debug.js'),
	quester: require('./quester.js'),
};

module.exports = borg;