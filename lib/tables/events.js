const tableName = 'events';
const create =
	`CREATE TABLE ${tableName}(
		type varchar(40),
		start timestamp,
		"end" timestamp,
		analysis_type varchar(40),
		latitude numeric,
		longitude numeric,
		mode varchar(40),
		distance integer
	)`;
const drop = `DROP TABLE IF EXISTS ${tableName}`;
const insert = `INSERT INTO ${tableName}(type, start, "end", analysis_type, latitude, longitude, mode, distance) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
const timeRange = `SELECT * FROM ${tableName} WHERE start >= $1 AND "end" < $2`;

module.exports = {
	create,
	drop,
	insert,
	timeRange,
};
