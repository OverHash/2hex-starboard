import { Client, Collection, Message, Role } from "discord.js";
import { settings } from "./config";
import database = require("./Util/database");
import fs = require('fs');

const db = database;

const bot = new Client();

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

fs.readdir('./runners/', (err, files) => {
	if (err) return console.log(err);

	files.forEach(file => {
		if (!file.endsWith('.js')) return;

		// check to see if there is runner
		const exportedFile = require(`./runners/${file}`);

		for (const event of exportedFile) {
			bot.on(event.name, event.run.bind(null, bot))
		}
	})
})

db.initiate()
	.then(() => bot.login(settings.token))
	.catch(err => console.log('Failed to initiate database/login to discord client: ' + err))