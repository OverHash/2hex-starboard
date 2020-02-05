import { Client, Message } from "discord.js";

module.exports = [
	{
		name: "message",
		run: (client: Client, message: Message) => {
			console.log(message.content + ' was found in economy.ts');
		}
	}
]