const request  = require('supertest');
const config   = require('../lib/config');
const server   = require('../lib/server');
const API      = require('../lib/api');

const API_HOST = process.env.API_HOST || `http://localhost:${config.apiPortInternal}`;
const agent    = request(API_HOST);

describe('Sentiance - API', () => {

	const api = new API(config);

	it('serves 404 for unknown endpoint', (done) => {
		agent
			.get('/doesnotexists')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404)
			.end(done);
	});

});
