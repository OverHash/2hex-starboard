"use strict";
const sqlite = require("sqlite3");
class database {
    constructor(dbFilePath) {
        this.db = new sqlite.Database(dbFilePath, (err) => {
            if (err)
                throw `Could not connect to database: ${err}`;
            console.log('Connected to database');
        });
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.log('Error running SQL: ' + sql);
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) {
                    console.log('Error running SQL: ' + sql);
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, data) => {
                if (err) {
                    console.log('Error running SQL: ' + sql);
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    initiate() {
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
            resolve();
        });
    }
}
module.exports = new database('./database.sqlite');
//# sourceMappingURL=database.js.map