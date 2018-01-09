const uuid     = require('uuid/v4');
const { Pool } = require('pg');
const moment   = require('moment');
const log      = require('./log');
const testData = require('../data/user.json');
const { eventsTable, momentsTable } = require('./tables');

class Store {

	constructor(config = {}) {
		this.config = config;
		this.pool = new Pool({
			host: this.config.pgHost,
			port: this.config.pgPort,
			user: this.config.pgUser,
			password: this.config.pgPassword,
			database: this.config.pgDb,
			max: this.config.pgPoolMax,
			idleTimeoutMillis: this.config.pgIdleTimeout,
			connectionTimeoutMillis: this.config.pgConnectionTimeout,
		});
	}

	createId() {
		return uuid();
	}

	async createEventsTable() {
		const client = await this.pool.connect();
		const dropQuery = {
			text: eventsTable.drop,
		};
		await client.query(dropQuery);
		const createQuery = {
			text: eventsTable.create,
		};
		return client.query(createQuery);
	}

	async createMomentsTable() {
		const client = await this.pool.connect();
		const dropQuery = {
			text: momentsTable.drop,
		};
		await client.query(dropQuery);
		const createQuery = {
			text: momentsTable.create,
		};
		return client.query(createQuery);
	}

	async ingestTestData() {
		const moments = testData.data.user.moment_history;
		const events = testData.data.user.event_history;
		const client = await this.pool.connect();
		try {
			await this.createEventsTable();
			await this.createMomentsTable();
			for (let moment of moments) {
				const query = {
					text: momentsTable.insert,
					values: [moment.start, moment.end, moment.analysis_type, moment.moment_definition_id],
				}
				await client.query(query);
			}

			for (let event of events) {
				const query = {
					text: eventsTable.insert,
					values: [event.type, event.start, event.end, event.analysis_type, event.latitude, event.longitude, event.mode, event.distance],
				}
				await client.query(query);
			}
		} finally {
			client.release();
		}
	}

	async queryEventsByTimeRange(start, stop) {
		const client = await this.pool.connect();
		const query = {
			text: eventsTable.timeRange,
			values: [start, stop],
		};
		try {
			const eventsByTimeRange = await client.query(query);
			return {
				count: eventsByTimeRange.rowCount,
				events: eventsByTimeRange.rows.map(row => ({ ...row, duration: this.getEventDuration(row) })),
			};
		} catch(err) {
			log.error(err, 'queryEventsByTimeRange');
		}finally {
			client.release()
		}
	}

	getEventDuration(event) {
		return moment(event.end).diff(moment(event.start));
	}

	loginUser({ userName, password }) {
		const user = {
			id: this.createId(),
			userName,
		};
		return Promise.resolve(user);
	}
}

module.exports = Store;
