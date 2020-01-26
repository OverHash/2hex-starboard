"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const discord_js_1 = require("discord.js");
module.exports = (client) => {
    if (config_1.settings.createReadyMessage) {
        console.log(`Logged in as ${client.user.tag} at ${new Date()}`);
        client.user.setActivity('devarchives', {
            type: 'WATCHING',
        });
        const readyEmbed = new discord_js_1.RichEmbed()
            .setTitle(`${client.user.username} logged in!`)
            .setColor(config_1.settings.colors.SUCCESS)
            .setTimestamp();
        // we must do this as `get` can return nil, but also because it could be of wrong type. currently there is no API to get a channel of type
        const loggingChannelGet = client.channels.get(config_1.settings.readyMessageChannelId);
        if (!loggingChannelGet)
            throw 'Failed to get logging channel, check config.readyMessageChannelId';
        if (!(loggingChannelGet.type === 'text'))
            throw 'Logging channel is not of type text, check config.readyMessageChannelId';
        // get logging channel
        const loggingChannel = loggingChannelGet;
        loggingChannel.send(readyEmbed);
    }
};
//# sourceMappingURL=ready.js.map