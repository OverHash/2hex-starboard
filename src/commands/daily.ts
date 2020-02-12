import { Client, Message, MessageEmbed } from "discord.js"
import { getEconomyData } from "../Util/getEconomy"
import database = require("../Util/database");
import { settings } from "../config";

module.exports = {
	props: {},

	run: (client: Client, message: Message, args: Array<string>, errorFunction: (string) => void) => {
		const member = message.member;
		if (!member) return;

		getEconomyData(member)
			.then(data => {
				const timeDifference = new Date().getTime() - new Date(data.lastDailyRewardClaimTime).getTime();

				if (timeDifference >= 1000 * 60 * 60 * 24) {
					// user can claim daily reward, give them some dosh, $10-$20
					const reward = Math.floor(Math.random() * (20 - 10)) + 10;

					data.lastDailyRewardClaimTime = new Date().toISOString()
					data.balance += reward;

					// update db
					database.run(`UPDATE economy SET lastDailyRewardClaimTime = '${data.lastDailyRewardClaimTime}', balance = ${data.balance} WHERE authorId = '${message.author.id}'`)
						.then(() => {
							const success = new MessageEmbed()
								.setTitle('Claimed daily reward!')
								.setColor(settings.colors.SUCCESS)

								.setDescription('Successfully claimed your daily reward of ' + reward + ' coins	, ' + member.displayName + '.\nCome back in 24 hours to claim again!')

								.setTimestamp()
								.setFooter(message.author.tag, message.author.displayAvatarURL())
							
							message.channel.send(success);
						})
						.catch(err => console.log('Failed to update daily reward data for ' + member.nickname + ' because\n' + err));
				}
			})
			.catch(err => console.log('Failed to get daily reward data for ' + member.nickname + ' because\n' + err));
	}
}

module.exports.props.data = {
	name: 'daily',
	description: 'Claims daily reward',
	usage: ['!daily'],
	aliases: ['claim'],
	type: 'everyone',
}