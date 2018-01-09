const create =
	`CREATE TABLE moments(
		start date,
		"end" date,
		analysis_type varchar(40),
		definition_id varchar(255)
	)`;

const drop = 'DROP TABLE IF EXISTS moments';
const insert = 'INSERT INTO moments(start, "end", analysis_type, definition_id) VALUES($1, $2, $3, $4)';

module.exports = {
	create,
	drop,
	insert,
};
