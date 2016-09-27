module.exports = {
	
	// Invite link
	invite: function(response)
	{
		response('Click here to invite me to your server: https://discordapp.com/oauth2/authorize?client_id=216636959349538816&scope=bot&permissions=0')
	},
	
	// Help
	help: function(response)
	{
		response('I\'m quester, a silly Discord bot that makes up a stupid sounding RPG adventure. Mention me and say one of the following to play:\n\n`start` - Initiates a new quest\n`end` - End your quest\n`status` - View your current status\n`perform <action>` - Performs the desired action of your choice\n`say <words>` - Speak the desired words of your choice\n`invite` - Get an invite link for this bot\n`games` - View currently active games');
	},
	
};