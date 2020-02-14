import { Client, Message, MessageEmbed } from "discord.js";
import { getEconomyData } from "../Util/getEconomy";
import * as dateformat from "dateformat";

module.exports = {
	props: {},

	run: (client: Client, message: Message, args: Array<string>, errorFunction: (string) => void) => {
		const member = message.member;
		if (!member) return;

		const otherUser = args[0];
		let targetUserBalance = member;

		if (otherUser) {
			// get id
			const id = otherUser.match(/(\d+)/);
			if (id && id[0]) {
				const otherUserMember = member.guild.member(id[0])
				if (otherUserMember) {
					targetUserBalance = otherUserMember;
				}
			}
		}

		getEconomyData(targetUserBalance)
			.then(data => {
				const oldClaimTime = new Date(data.lastDailyRewardClaimTime);
				const nextClaimTime = new Date(oldClaimTime.getTime() + 1000 * 60 * 60 * 24);

				const waitTime = nextClaimTime.getTime() - Date.now();

				let result: string;
				if (waitTime < 0) {
					// user can claim *now*
					result = 'Now!'
				} else {
					const hours = ("0" + Math.floor(waitTime / 1000 / 60 / 60)).slice(-2);
					const minutes = ("0" + Math.floor(waitTime / 1000 / 60 % 60)).slice(-2);
					const seconds = ("0" + Math.floor(waitTime / 1000 % 60)).slice(-2);
					
					result = `In ${hours}:${minutes}:${seconds}`
				}

				const embed = new MessageEmbed()
					.setTitle(targetUserBalance.displayName + '\'s balance')
					.setColor(targetUserBalance.displayHexColor)

					.addField('Balance', data.balance, true)
					.addField('Next Daily Reward Time', result)

					.setTimestamp()
					.setFooter(message.author.tag, message.author.displayAvatarURL())
				
				message.channel.send(embed);
			})
			.catch(err => console.log('error getting balance for ' + member.nickname + ' because\n' + err));
	}
}

module.exports.props.data = {
	name: 'balance',
	description: 'Gets user balance',
	usage: ['!balance', '!help [@person]'],
	aliases: ['bal', 'total'],
	type: 'everyone',
}