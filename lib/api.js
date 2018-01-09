const Boom   = require('boom');
const jwt    = require('jsonwebtoken');
const Store  = require('./store');
const config = require('./config');


class API {

	constructor(config = {}) {
		this.config = config;
		this.store = new Store(this.config);
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
		return Promise.reject(Boom.badRequest('Please provide a valid userName and password!'));
	}

}

module.exports = API;
