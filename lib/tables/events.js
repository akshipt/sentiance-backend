const create =
	`CREATE TABLE events(
		type varchar(40),
		start date,
		"end" date,
		analysis_type varchar(40),
		latitude numeric,
		longitude numeric,
		distance integer
	)`;
const drop = 'DROP TABLE IF EXISTS events';
const insert = 'INSERT INTO events(type, start, "end", analysis_type, latitude, longitude, distance) VALUES($1, $2, $3, $4, $5, $6, $7)';

module.exports = {
	create,
	drop,
	insert,
};
