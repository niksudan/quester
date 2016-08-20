var borg = {
	name: 'borg',
	mention: false,
	responses: [
		[/\b(h(e(y|llo)|i))|(yo)\b/i, 'debug', 'greet'],
	],
	
	handle: function(message, response)
	{
		var responded = false;
		for (var i = 0; i < this.responses.length; i++) {
			if (!responded && message.match(this.responses[i][0])) {
				if (borg.mention && message.indexOf(borg.mention) > -1) {
					responded = true;
					this[this.responses[i][1]][this.responses[i][2]](response, message, this.responses[i][0]);
					break;
				}
			}
		}
	},
	
	logic: require('./debug.js'),
};

module.exports = borg;