const fs = require('fs');
const path = require('path');

module.exports = {
	name: 'cancelEmbed',
	description: 'Cancels a given embed',
	requiresCommandChannel: true,
	execute: (message) => {
		const currentEmbeds = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../markedEmbeds.json')));
		if (currentEmbeds) {
			for (const k in currentEmbeds) {
				const embed = currentEmbeds[k];
				if (embed.author === message.author.id) {
					currentEmbeds.splice(k, 1);
				}
			}
		}

		// save
		fs.writeFileSync(path.resolve(__dirname, '../markedEmbeds.json'), JSON.stringify(currentEmbeds, null, 4));
	},
};