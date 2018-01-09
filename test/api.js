const request  = require('supertest');
const config   = require('../lib/config');
const server   = require('../lib/server');
const API      = require('../lib/api');

const API_HOST = process.env.API_HOST || `http://localhost:${config.apiPortInternal}`;
const agent    = request(API_HOST);

describe('Sentiance - API', () => {

	const api = new API(config);
	const testData = {};

	it('serves 404 for unknown endpoint', (done) => {
		agent
			.get('/doesnotexists')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404)
			.end(done);
	});

	it('logs in without credentials', (done) => {
		agent
			.post('/users/login')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401)
			.expect(res => {
				expect(res.body).to.eql({
					statusCode: 401,
					error: 'Unauthorized',
					message: 'Please provide a valid userName and password!',
				});
			}).end(done);
	});

	it('logs in using wrong credentials', (done) => {
		agent
			.post('/users/login')
			.set('Accept', 'application/json')
			.send({ userName: 'wrong', password: 'user' })
			.expect('Content-Type', /json/)
			.expect(401)
			.expect(res => {
				expect(res.body).to.eql({
					statusCode: 401,
					error: 'Unauthorized',
					message: 'Please provide a valid userName and password!',
				});
			}).end(done);
	});

	it('logs in using correct credentials', (done) => {
		agent
			.post('/users/login')
			.set('Accept', 'application/json')
			.send({ userName: config.adminUser, password: config.adminPassword })
			.expect('Content-Type', /json/)
			.expect(200)
			.expect(res => {
				expect(res.body).to.have.property('token');
				expect(res.body).to.have.property('user');
				expect(res.body.user).to.have.property('id');
				expect(res.body.user).to.have.property('userName').that.eql(config.adminUser);
				testData.adminToken = res.body.token;
			}).end(done);
	});

	it('gets event list by time range without token', (done) => {
		agent
			.get('/events')
			.set('Accept', 'application/json')
			.query({ start: new Date().toISOString(), end: new Date().toISOString(), })
			.expect('Content-Type', /json/)
			.expect(401)
			.expect(res => {
				expect(res.body).to.eql({
					statusCode: 401,
					error: 'Unauthorized',
					message: 'No authorization header present in request.',
				});
			}).end(done);
	});

	it('gets event list by time range with admin token', (done) => {
		const start = '2017-09-26T07:45:00.000+07:00';
		const end = '2017-10-01T23:28:00.000+02:00';
		agent
			.get('/events')
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${testData.adminToken}`)
			.query({ start, end, })
			.expect('Content-Type', /json/)
			.expect(200)
			.expect(res => {
				expect(res.body).to.have.property('events').that.is.an('array').with.length(94);
				expect(res.body).to.have.property('count').that.eql(94);
				expect(res.body).to.have.property('aggregations').that.eql({
					transportation: {
						all: {
							numberOfEvents: 53,
							totalDistance: 9710776,
							totalDuration: 38758787,
						},
						biking: {
							totalDistance: 2615,
							totalDuration: 4299000,
							numberOfEvents: 4,
						},
						car: {
							totalDistance: 178927,
							totalDuration: 22277357,
							numberOfEvents: 30,
						},
						flight: {
							totalDistance: 9517692,
							totalDuration: 4561378,
							numberOfEvents: 4,
						},
						tram: {
							totalDistance: 1573,
							totalDuration: 360000,
							numberOfEvents: 1,
						},
						walking: {
							totalDistance: 9969,
							totalDuration: 7261052,
							numberOfEvents: 14,
						},
					},
				});
			}).end(done);
	});

});
