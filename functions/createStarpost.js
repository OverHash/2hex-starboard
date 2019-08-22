const discord = require('discord.js');

module.exports = function(message, archiveNumber) {
	return new discord.RichEmbed()
		.setColor('#00BFFF')
		.setAuthor(message.author.username + '#' + message.author.discriminator, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar)
		.setImage(message.attachments.first().url)

		.addField('Source', '[jump](https://discordapp.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + ')')

		.setTimestamp()
		.setFooter('Bot created by OverHash#6449 | Archive ' + archiveNumber);
};