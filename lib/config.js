const defaultConfig = {
	"s3Region": "eu-west-1",
	"apiHost": "http://localhost",
	"apiPortInternal": 8080,
	"apiPortExternal": 3000,
	"apiPath": "",
	"jwtSecret": "78WfZPBgtWKhaYpJFFTjzodRrnmduxvD",
	"adminUser": "sentiance",
	"adminPassword": "moments",
	"pgHost": "localhost",
	"pgPort": 5432,
	"pgUser": "sentiance",
	"pgPassword": "sentiance",
	"pgDb": "sentiance",
	"pgPoolMax": 20,
	"pgIdleTimeout": 30000,
	"pgConnectionTimeout": 2000,
};

const config = {};

for (const key in defaultConfig) {
	const envKey = `SENTIANCE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
	if (process.env[envKey] && process.env[envKey].length) {
		config[key] = process.env[envKey];
	} else {
		config[key] = defaultConfig[key];
	}
}

module.exports = config;
