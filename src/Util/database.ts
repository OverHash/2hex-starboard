import * as sqlite from "sqlite3";

class database {
	public readonly db: sqlite.Database;

	constructor(dbFilePath: string) {
		this.db = new sqlite.Database(dbFilePath, (err) => {
			if (err) throw `Could not connect to database: ${err}`;

			console.log('Connected to database');
		})
	}

	get(sql: string, params: Array<any> = []) {
		return new Promise((resolve, reject) => {
			this.db.get(sql, params, (err, result) => {
				if (err) {
					console.log('Error running SQL: ' + sql);
					console.log(err);
					reject(err);
				} else {
					resolve(result);
				}
			})
		})
	}

	run(sql: string, params: Array<any> = []): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, (err) => {
				if (err) {
					console.log('Error running SQL: ' + sql);
					console.log(err);
					reject(err);
				} else {
					resolve();
				}
			})
		})
	}

	all(sql: string, params: Array<any> = []) {
		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, data) => {
				if (err) {
					console.log('Error running SQL: ' + sql);
					console.log(err);
					reject(err);
				} else {
					resolve(data)
				}
			})
		})
	}

	initiate(): Promise<void> {
		return new Promise(resolve => {
			this.run(`
			CREATE TABLE IF NOT EXISTS embeds (
				embedId integer PRIMARY KEY AUTOINCREMENT,
				messageId varchar(20) NOT NULL,
				authorId varchar(20) NOT NULL,
				channelId varchar(20) NOT NULL,
				infoMessageId varchar(20) NOT NULL,
				status varchar(10)
			);`);
			this.run(`
			CREATE TABLE IF NOT EXISTS economy (
				economyId integer PRIMARY KEY AUTOINCREMENT,
				authorId varchar(20) NOT NULL,
				balance integer NOT NULL,
				lastDailyRewardClaimTime varchar(20) NOT NULL,
				lastMessageTime varchar(20) NOT NULL
			);`)

			resolve()
		})
	}
}

// make new db
export = new database('./database.sqlite');