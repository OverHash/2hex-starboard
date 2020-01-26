const fs = require('fs');

const path_location = './economy.json';
module.exports = function(user) {
	const economy = JSON.parse(fs.readFileSync(path_location, 'utf-8'));

	let user_data = economy.find(data => data.id === user.id);

	if (!user_data) {
		user_data = {
			id: user.id,
			balance: 0,
			lastDailyRewardClaimTime: 0,
			lastMessageTime: 0,
		};
		economy[economy.length] = user_data;
		fs.writeFileSync('./economy.json', JSON.stringify(economy, null, 4));
	}

	return user_data;
};