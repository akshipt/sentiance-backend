const config   = require('../lib/config');
const API      = require('../lib/api');

const prepare = async (done) => {
	const api = new API(config);
	await api.store.ingestTestData();
	done();

};

prepare(process.exit);
