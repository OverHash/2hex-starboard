const discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const isModerator = require('../functions/isModerator.js');

module.exports = {
	name: 'embed',
	description: 'Creates an embed for a desired channel',
	async execute(message) {
		// check if user has a pre-existing embed
		const currentEmbeds = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../markedEmbeds.json')));
		if (currentEmbeds) {
			for (const k in currentEmbeds) {
				const embed = currentEmbeds[k];
				if (embed.author === message.author.id) {
					return message.channel.send('Sorry! You already have an ongoing embed!');
				}
			}
		}

		if (!isModerator(message.member)) return message.channel.send('You are required to be a moderator to execute this command!');

		// create new embed generator
		message.channel.send('Your current embed looks like this.\n\n:a: - Change title\n:rainbow: - Change Color\n:link: - Change URL\n:footprints: - Change footer\n:clock7: - Toggle timestamp\n:e_mail: - Change description\n:bearded_person: - Edit role to mention\n:regional_indicator_f: - Edit fields\n:white_check_mark: - Proceed to sending!\n:wastebasket: - Delete embed', new discord.RichEmbed())
			.then(async (msg) => {
				currentEmbeds.push({ author: message.author.id, id: msg.id, channelId: message.channel.id });

				await fs.writeFileSync(path.resolve(__dirname, '../markedEmbeds.json'), JSON.stringify(currentEmbeds, null, 4));

				await msg.react('🅰');
				await msg.react('🌈');
				await msg.react('🔗');
				await msg.react('👣');
				await msg.react('🕖');
				await msg.react('📧');
				await msg.react('🧔');
				await msg.react('🇫');
				await msg.react('✅');
				await msg.react('🗑');
			})
			.catch(err => message.channel.send('Whoopsies, that didn\'t make me feel to good.\n\n' + err));

	},
};