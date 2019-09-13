const discord = require('discord.js');

const allowedRoles = [
	'animator',
	'builder',
	'composer',
	'designer',
	'gamer',
	'investor',
	'producer',
	'programmer',
	'streamer',
	'tester',
	'trader',
	'translator',
	'voiceactor',
	'gamenight',
	'gamejam',
	'hiring',
	'nothiring',
	'neutral',
	'buildhelper',
	'programhelper',
	'designhelper',
	'uihelper',
	'botupdates',
];

module.exports = function(message) {
	const member = message.member;
	const guild = message.guild;
	const guildRoles = guild.roles;


	const messageContent = message.content.slice(1);

	if (!allowedRoles.find(object => object == messageContent)) {
		return;
	}

	const role = guildRoles.find(object => object.name == messageContent);

	/* Check that the role exists */
	if (!role) {
		return;
	}

	/* Check that the user already has the role */
	const memberRoles = member.roles;

	const responseEmbed = new discord.RichEmbed()
		.setAuthor(member.displayName)
		.setFooter('Made by OverHash#6449')
		.setTimestamp()
		.setTitle('Role changes');

	if (memberRoles.find(r => r.name == role.name)) {
		/* remove the role */
		member.removeRole(role, 'User requested to remove this role');
		responseEmbed.setDescription('✅ Successfully removed the role ' + role.name)
		responseEmbed.setColor('#FF4136');
	} else {
		/* add them the role */
		member.addRole(role, 'User requested to receive this role');
		responseEmbed.setDescription('✅ Successfully gave you the role ' + role.name)
		responseEmbed.setColor('#32CD32');
	}

	message.channel.send(responseEmbed);
};