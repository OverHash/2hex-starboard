const settings = {
	colors: {
		"DEFAULT": "6d89ea",
		"SUCCESS": '43B581',
		"FAILED": 'fc5656',
		"HAZARD": 'fc9e3a'
	},
}

module.exports = {
	name: 'eval',
	description: 'Evaluates an expression',
	async execute(message, args) {
		const client = message.client;
		let ev = clean(client, args.join(' '));
		let silent = false;
		let hide = false;

		if (hide) message.delete();
		let err = false;
		let evaled;

		try {
			evaled = await eval(ev);
			if (typeof evaled !== "string")
				evaled = inspect(evaled);
		} catch (e) {
			evaled = e.stack;
			err = true;
		}
		const embed = new MessageEmbed()
			.addField("Input", "```xl\n" + clean(client, ev) + "```")
			.addField("Output", "```xl\n" + clean(client, evaled).slice(0, 900) + "```")
			.setTimestamp();
		err ? embed.setColor(settings.colors.FAILED) : embed.setColor(settings.colors.SUCCESS);
		if (!silent) message.channel.send(embed);

	},
};

