const fs = require('fs');
const discord = require('discord.js');

const checkReward = require('../functions/checkReward');
const getUserEconomy = require('../functions/getUserEcomony');

const economyPath = './economy.json';

module.exports = {
	name: 'daily',
	description: 'Claims the daily economy reward',
	requiresCommandChannel: true,
	execute(message, args) {
		const user = message.author;

		const userNextRewardData = checkReward(user);
		const now = Date.now();

		const canClaim = userNextRewardData[2];

		if (canClaim) {
			const economy = JSON.parse(fs.readFileSync(economyPath, 'utf-8'));
			const userEconomny = getUserEconomy(user);

			const reward = Math.floor(Math.random() * (100 - 30 + 1)) + 30;

			userEconomny.lastDailyRewardClaimTime = now;
			userEconomny.balance += reward;

			const balanceEmbed = new discord.RichEmbed()
				.setAuthor(message.member.displayName, user.displayNameURL)
				.setTitle('Daily Reward')
				.setDescription(`You were rewarded with **$${reward}**!`)
				.setColor('#00ff00')
				.setFooter('Bot made by OverHash#6449')
				.setTimestamp();

			economy[economy.findIndex(userData => userData.id === userEconomny.id)] = userEconomny

			fs.writeFileSync(economyPath, JSON.stringify(economy, null, 4));

			return message.channel.send(balanceEmbed);
		} else {
			return message.channel.send('You cannot claim your daily reward for another ' + new Date(userNextRewardData[1] - userNextRewardData[0]).toISOString().substr(11, 8));
		}
	},
};