const config = require('../lib/config');
const Store  = require('../lib/store');

describe('Sentiance - Store', () => {

	const store = new Store(config);

	it('is correctly initialized', () => {
		expect(store).to.respondTo('createId');
		expect(store).to.have.property('pool');
	});

	it('ingests test data', async () => {
		await store.ingestTestData();
	});

});
