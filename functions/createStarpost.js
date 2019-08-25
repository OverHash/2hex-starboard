const discord = require('discord.js');
const quickdb = require('quick.db');

module.exports = function(message, archiveNumber) {
	const data = quickdb.fetch('archiveData_' + archiveNumber);
	const embed = new discord.RichEmbed()
		.setColor('#00BFFF')
		.setAuthor('ID #' + archiveNumber, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar)

		.addField('Author', '<@' + data.authorId + '>', true)
		.addField('Source', '[jump](https://discordapp.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + ')', true)

		.setTimestamp(data.date)
		.setFooter('Stored at');

	if (message.embeds[0] && message.embeds[0].url) {
		embed.setImage(message.embeds[0].url);
	} else if (message.attachments.first()) {
		embed.setImage(message.attachments.first().url);
	}

	return embed;
};