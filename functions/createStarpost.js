const discord = require('discord.js');
const quickdb = require('quick.db');

module.exports = function(message, archiveNumber) {
	const data = quickdb.fetch('archiveData_' + archiveNumber);
	return new discord.RichEmbed()
		.setColor('#00BFFF')
		.setAuthor('ID #' + archiveNumber, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar)
		.setImage(message.attachments.first().url)

		.addField('Author', '<@' + data.authorId + '>', true)
		.addField('Source', '[jump](https://discordapp.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + ')', true)

		.setTimestamp(data.date)
		.setFooter('Stored at');
};