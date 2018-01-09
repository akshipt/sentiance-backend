const _      = require('lodash');
const Boom   = require('boom');
const jwt    = require('jsonwebtoken');
const Store  = require('./store');
const config = require('./config');

class API {

	constructor(config = {}) {
		this.config = config;
		this.store = new Store(this.config);
	}

	// Middleware for router usage
	tokenMiddleware() {
		const api = this;
		return async (ctx, next) => {
			const authorizationHeader = ctx.get('authorization');
			ctx.state.tokenUser = await api.authorizeUser(authorizationHeader);
			await next();
		};
	}

	authorizeUser(authorizationHeader) {
		return new Promise((resolve, reject) => {
			if (!authorizationHeader) return reject(Boom.unauthorized('No authorization header present in request.'));
			const token = authorizationHeader.split(' ');
			if (token[0] === 'Bearer' && token[1].length > 0) {
				jwt.verify(token[1], this.config.jwtSecret, function(err, decoded) {
					if (err) {
						log.error(err, 'jwt verify error');
						reject(Boom.unauthorized('Invalid authorization header in request.'));
					} else {
						if (decoded && decoded.id) {
							resolve(decoded);
						} else {
							reject(Boom.unauthorized('Invalid token payload.'));
						}
					}
				});
			} else {
				return reject(Boom.unauthorized('Invalid authorization header in request.'));
			}
		});
	}

	async getApp() {
		// get graph data from store
		const world = await this.store.getWorldData();

		return {
			config: {
				testProp: 'testVal'
			},
			graphs: {
				world,
			},
		};
	}

	async loginUser(loginData = {}) {
		const { userName = '', password = '', token } = loginData;
		if (token) {
			try {
				const user = jwt.verify(token, this.config.jwtSecret);
				return { user, token };
			} catch (err) {
				return Promise.reject(Boom.unauthorized('Invalid token, please login again'));
			}
		}
		if (userName === this.config.adminUser && password === this.config.adminPassword ) {
			const user = await this.store.loginUser(loginData);
			const token = jwt.sign(user, this.config.jwtSecret);
			return { user, token };
		}
		return Promise.reject(Boom.unauthorized('Please provide a valid userName and password!'));
	}

	async getEvents({ start, end }) {
		const result = await this.store.queryEventsByTimeRange(start, end);
		const aggregations =  await this.calculateAggregations(result.events);
		return { ...result, aggregations };
	}

	calculateAggregations(events) {
		const aggregations = {
			transportation: {},
		};
		const transportEvents = _.filter(events, { type: 'Transport' });
		const transportByMode = _.groupBy(transportEvents, 'mode');
		for (let mode in transportByMode) {
			aggregations.transportation[mode] = {
				totalDuration: _.reduce(transportByMode[mode], (sum, value) => sum + value.duration, 0),
				totalDistance: _.reduce(transportByMode[mode], (sum, value) => sum + value.distance, 0),
				numberOfEvents: transportByMode[mode].length,
			};
		}
		return aggregations;
	}

}

module.exports = API;
