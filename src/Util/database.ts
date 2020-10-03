import * as sqlite from "sqlite3";

class database {
	public readonly db: sqlite.Database;

	constructor(dbFilePath: string) {
		this.db = new sqlite.Database(dbFilePath, (err) => {
			if (err) throw `Could not connect to database: ${err}`;
		})
	}

	/**
	 * Runs the SQL query with the specified parameters. It returns the **first** row afterwards.
	 * @param sql The SQL query to run
	 * @param params When the sQL statement contains placeholders, you can pass them in here.
	 */
	get<T = void>(sql: string, params: Array<any> = []): Promise<T | undefined> {
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

	/**
	 * Runs the SQL query with the specified parameters. **It does not retrieve any result data.**
	 * @param sql The SQL query to run
	 * @param params When the sQL statement contains placeholders, you can pass them in here.
	 */
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

	/**
	 * Runs the SQL query with the specified parameters. Returns **all** result rows afterwards.
	 * @param sql The SQL query to run
	 * @param params When the sQL statement contains placeholders, you can pass them in here.
	 */
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
			);`);
			this.run(`
			CREATE TABLE IF NOT EXISTS archives (
				archiveId integer PRIMARY KEY AUTOINCREMENT,
				messageId varchar(20) NOT NULL,
				archiveMessageId varchar(20) NOT NULL,
				authorId varchar(20) NOT NULL
			);`);
			this.run(`
			CREATE TABLE IF NOT EXISTS messageCache (
				id integer PRIMARY KEY AUTOINCREMENT,
				messageId varchar(20) NOT NULL
			);
			`);
			
			resolve()
		})
	}
}

// make new db
export = new database('./database.sqlite');