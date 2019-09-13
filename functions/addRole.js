const discord = require('discord.js');

const allowedRoles = [
	'Animator',
	'Builder',
	'Composer',
	'Designer',
	'Gamer',
	'Investor',
	'Producer',
	'Programmer',
	'Streamer',
	'Tester',
	'Trader',
	'Translator',
	'Voice Actor',
	'Game Night',
	'Gamejam',
	'For Hire',
	'Not For Hire',
	'Builder Helper',
	'Program Helper',
	'Design Helper',
	'UI Helper',
];

module.exports = function(message) {
	const member = message.member;
	const guild = message.guild;
	const guildRoles = guild.roles;


	const messageContent = message.content.slice(1);

	/*
	if (!allowedRoles.find(object => object === messageContent)) {
		return;
	} */

	/* first = regular
	second = lower case
	third = no space regular
	fourth = no space lower case */
	const role = guildRoles.find(object => (object.name === messageContent) || (object.name.toLowerCase() === messageContent.toLowerCase()) || (object.name.replace(/\s/g, '') === messageContent) || (object.name.toLowerCase().replace(/\s/g, '') === messageContent.toLowerCase()));

	/* Check that the role exists */
	if (!role || !allowedRoles.find(object => object === role.name)) {
		return;
	}

	/* Check that the user already has the role */
	const memberRoles = member.roles;

	const responseEmbed = new discord.RichEmbed()
		.setAuthor(member.displayName)
		.setFooter('Made by OverHash#6449')
		.setTimestamp()
		.setTitle('Role changes');

	if (memberRoles.find(r => r.name === role.name)) {
		/* remove the role */
		member.removeRole(role, 'User requested to remove this role');
		responseEmbed.setDescription('✅ Successfully removed the role ' + role.name);
		responseEmbed.setColor('#FF4136');
	} else {
		/* add them the role */
		member.addRole(role, 'User requested to receive this role');
		responseEmbed.setDescription('✅ Successfully gave you the role ' + role.name);
		responseEmbed.setColor('#32CD32');
	}

	message.channel.send(responseEmbed);
};