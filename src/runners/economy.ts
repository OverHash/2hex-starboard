import { Client, Message } from "discord.js";
import database = require("../Util/database");
import getEconomy = require("../Util/getEconomy");

module.exports = [
	{
		name: "message",
		run: (client: Client, message: Message) => {
			if (!message.member) return;
			if (message.author.bot) return;

			getEconomy.getEconomyData(message.member)
				.then(stats => {
					const lastTime = new Date(stats.lastMessageTime);

					const now = new Date();

					if (now.getTime() - lastTime.getTime() >= 1000 * 60) {
						// user gets some extra dosh
						stats.lastMessageTime = now.toISOString();
						// a simple way to calculate a random number between 2 and 5
						stats.balance += Math.floor(Math.random() * (5 - 2) + 2);

						// update sql database
						database.run(`UPDATE economy SET lastMessageTime = '${stats.lastMessageTime}', balance = ${stats.balance};`)
							.catch(err => console.log('Error updating economy for ' + message.author.username + '.\n' + err))
					}
				})
				.catch(err => console.log('Failed to get economy data for ' + message.author.username + ' because ' + err));
		}
	}
]