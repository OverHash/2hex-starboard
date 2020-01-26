"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const database = require("./Util/database");
const fs = require("fs");
const db = database;
const bot = new discord_js_1.Client();
bot.on('ready', () => {
    console.log('logged in');
});
fs.readdir('./events/', (err, files) => {
    if (err)
        return console.log(err);
    files.forEach(file => {
        if (!file.endsWith('.js'))
            return;
        // connect to event
        const event = require(`./events/${file}`);
        bot.on(file.split('.')[0], event.bind(null, bot));
        delete require.cache[require.resolve('./events/' + file)];
    });
});
fs.readdir('./commands/', (err, files) => {
    if (err)
        return console.log(err);
    files.forEach(file => {
        if (!file.endsWith('.js'))
            return;
        const command = require('./commands/' + file);
        const name = file.split('.')[0];
    });
});
db.initiate()
    .then(() => bot.login(config_1.settings.token))
    .catch(() => console.log('Failed to initiate database'));
//# sourceMappingURL=index.js.map