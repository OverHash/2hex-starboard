import { Message, GuildChannel, Guild, CategoryChannel, TextChannel, MessageEmbed } from "discord.js";
import { settings } from "../config";
import database = require("./database");
import { runInThisContext } from "vm";

const months = [
	'january',
	'feburary',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december-'
];

function getCurrentYearCategory(guild: Guild, year: number): Promise<CategoryChannel> {
	return new Promise((resolve, reject) => {
		const lastYear = guild.channels.cache.find(channel => channel.type === 'category' && channel.name === (year - 1).toString());
		const currentYearCategory = guild.channels.cache.filter(channel => channel.type === 'category' && channel.name === year.toString()).first() as CategoryChannel;

		if (currentYearCategory) {
			return resolve(currentYearCategory);
		}

		guild.channels.create(year.toString(), {
			type: 'category',
			position: (lastYear ? lastYear.position - 1 : 3),
		})
			.then(category => resolve(category))
			.catch(err => console.log('Failed to create category for new year because ' + err));
	})
}

function getCurrentMonthCategory(currentYearCategoryPassed: CategoryChannel, month: number): Promise<TextChannel> {
	return new Promise((resolve, reject) => {
		const lastMonth = currentYearCategoryPassed.children.find(channel => channel.type === 'text' && channel.name === months[month - 1]) as TextChannel;
		const currentMonth = currentYearCategoryPassed.children.find(channel => channel.type === 'text' && channel.name === months[month]) as TextChannel;

		if (currentMonth) {
			return resolve(currentMonth)
		}

		currentYearCategoryPassed.guild.channels.create(months[month], {
			type: 'text',
			position: lastMonth ? lastMonth.position + 1 : 1,
			parent: currentYearCategoryPassed
		})
			.then(channel => resolve(channel))
			.catch(err => console.log('Failed to create channel for ' + months[month] + ' because: ' + err))
	})
}

function createStarpost(message: Message): Promise<MessageEmbed> {
	return new Promise(async (resolve, reject) => {
		const res: { total: number } | undefined = await database.get<{ total: number }>('SELECT COUNT(*) as total FROM archives;')
		if (!res) reject('Expected SELECT COUNT(*) as total FROM archives to return something, but it didn\'t');

		const starpost = new MessageEmbed()
			.setColor(settings.colors.DEFAULT)
			.setAuthor('ID # ' + (res ? res.total + 1 : 1), message.author.displayAvatarURL())
		
			.addField('Author', '<@' + message.author.id + '>', true)
			.addField('Source', '[jump](https://discordapp.com/channels/' + settings.communityGuildId + '/' + settings.communitySubmissionChannelId + '/' + message.id + ')', true)
		
			.setTimestamp()
			.setFooter('Stored at');
						
		// images?
		const content = message.attachments.first();
		if (content) {
			starpost.setImage(content.url)
		};

		// RichEmbed in the message
		const richEmbed = message.embeds[0];
		if (richEmbed) {
			// image embed
			if (richEmbed.url && richEmbed.image && richEmbed.type === 'image') {
				starpost.setImage(richEmbed.image.url)
			}

			// video embed
			if (richEmbed.type === 'video' && richEmbed.thumbnail) {
				starpost.setImage(richEmbed.thumbnail.url);
			}

			// gif embed
			if (richEmbed.type === 'gifv') {

			}
		} else {
			starpost.setDescription('No preview available');
		}

		resolve(starpost);
	})
}

export = (message: Message): Promise<Message> => {
	return new Promise((resolve, reject) => {
		const client = message.client;

		const starboardGuild = client.guilds.cache.get(settings.starboardGuildId);
		if (!starboardGuild) throw 'Expected to be able to get starboardGuildId, but it couldn\'t be found.';

		const currentDate = new Date();

		const year = currentDate.getUTCFullYear();
		const currentMonth = currentDate.getUTCMonth();

		
		getCurrentYearCategory(starboardGuild, year)
			.then(currentYearCategory => getCurrentMonthCategory(currentYearCategory, currentMonth))
			.then(currentMonthChannel => {
				createStarpost(message)
					.then(starpost => currentMonthChannel.send(starpost))
					.then(starpost => resolve(starpost))
			})
		
			.catch(err => console.log('Failed to get the current text channel for starposts because: ' + err));
	})
}