const config = require('../lib/config');
const Store  = require('../lib/store');

describe('Sentiance - Store', () => {

	const store = new Store(config);

	it('is correctly initialized', () => {
		expect(store).to.respondTo('createId');
		expect(store).to.have.property('pool');
		expect(store).to.have.property('createEventsTable');
		expect(store).to.have.property('createMomentsTable');
		expect(store).to.have.property('ingestTestData');
		expect(store).to.have.property('queryEventsByTimeRange');
	});

	it('ingests test data', async () => {
		await store.ingestTestData();
	});

	it('queries data by time range', async () => {
		const start = '2017-09-26T07:45:00.000+07:00';
		const end = '2017-10-01T23:28:00.000+02:00';
		const result = await store.queryEventsByTimeRange(start, end);
		expect(result.count).to.eql(94);
		expect(result.events).to.have.length(94);
	});

});
