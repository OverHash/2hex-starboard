const discord = require('discord.js');

const checkReward = require('../functions/checkReward.js');
const getUserEconomy = require('../functions/getUserEcomony.js');

module.exports = {
	name: 'balance',
	description: 'Gets a user\'s balance',
	async execute(message, args) {
		const user = message.author;

		const data = getUserEconomy(user);

		const check_reward = checkReward(user);

		const balance_embed = new discord.RichEmbed()
			.setAuthor(message.member.displayName, message.author.displayAvatar)
			.setTitle('Balance')
			.setDescription(`You have $${data.balance} to spend!\n\n${check_reward[2] ? 'You can claim your daily reward with -daily' : `You can claim your next daily reward in ${new Date(check_reward[1] - check_reward[0]).toISOString().substr(11, 8)}`}`)
			.setColor('#431075')
			.setFooter('Bot made by OverHash#6449')
			.setTimestamp();

		message.channel.send(balance_embed);
	},
};