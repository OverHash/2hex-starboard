const months = [ 'january', 'feburary', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];


module.exports = async function(guild) {
	const currentDate = new Date;
	const year = currentDate.getFullYear().toString();
	const currentMonth = currentDate.getMonth();
	const month = months[currentMonth];

	const lastYear = guild.channels.filter(channel => (channel.type === 'category' && channel.name === (year - 1).toString())).first();
	const yearCategory = await (guild.channels.filter(channel => (channel.type === 'category' && channel.name === year)).first() || guild.createChannel(year, { type: 'category', 'position': (lastYear && lastYear.position - 2 || 1) }));


	console.log('Getting channel');
	const lastMonth = guild.channels.filter(channel => (channel.type === 'text' && channel.name === months[(currentMonth - 1).toString()]));
	const monthChannel = guild.channels.filter(channel => (channel.type === 'text' && channel.parent === yearCategory && channel.name === month)).first() || await guild.createChannel(month, { type: 'text', 'position': (lastMonth && lastMonth.position || 0), 'parent': yearCategory });

	console.log(monthChannel.name, 'is the channel name');
	return monthChannel;
};