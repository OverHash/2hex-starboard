import { GuildMember } from "discord.js";
import database = require('../Util/database');
import * as t from "io-ts";
import { economyGetResponse } from "./databaseTypings";

export interface economyData {
	economyId: number,
	authorId: string,
	balance: number,
	lastDailyRewardClaimTime: string,
	lastMessageTime: string
}

const UserStats = t.type({
	economyId: t.number,
	authorId: t.string,
	balance: t.number,
	lastDailyRewardClaimTime: t.string,
	lastMessageTime: t.string
})

export function getEconomyData(member: GuildMember): Promise<economyData> {
	return new Promise((resolve, reject) => {
		database.get(`SELECT * FROM economy WHERE authorId='${member.id}'`)
			.then(userStats => {

				// check if it exists && is valid type
				if (userStats) {
					if (!UserStats.is(userStats)) {
						return reject('Expected the match interface economyData, but it didn\'t.');
					}

					return resolve(userStats);
				}

				// user has no data, let's create some
				database.run(`INSERT INTO economy (authorId, balance, lastDailyRewardClaimTime, lastMessageTime) VALUES ('${member.id}', 0, '0', '0');`)
					.then(() => database.get<economyGetResponse>(`SELECT * FROM economy WHERE authorId = '${member.id}';`))
					.then((data: economyData) => resolve(data))
					.catch(err => reject(err));
			})
	})
}