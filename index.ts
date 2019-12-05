import { Client } from "discord.js";

require('dotenv').config()

const bot = new Client();

bot.on('ready', () => {
	console.log('logged in');
})

bot.login(process.env.token)