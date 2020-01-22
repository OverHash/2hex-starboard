import { Client, Collection, Message, Role } from "discord.js";
import { settings } from "./config";
import database = require("./Util/database");
import fs = require('fs');

const db = database;

const bot = new Client();

bot.on('ready', () => {
	console.log('logged in');
})

bot.on('message', message => {
	const guild = message.guild;

	if (guild && guild.available) {
		guild.roles.forEach(role => {
			console.log(role.name, role.position, role.rawPosition)
		})
	}
})

fs.readdir('./events/', (err, files) => {
	if (err) return console.log(err);

	files.forEach(file => {
		if (!file.endsWith('.js')) return;

		// connect to event
		const event = require(`./events/${file}`);
		bot.on(file.split('.')[0], event.bind(null, bot));

		delete require.cache[require.resolve('./events/' + file)]
	})
})

db.initiate()
	.then(() => bot.login(settings.token))
	.catch(err => console.log('Failed to initiate database/login to discord client: ' + err))