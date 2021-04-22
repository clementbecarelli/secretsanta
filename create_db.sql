DROP database secretsanta;

CREATE database IF NOT EXISTS secretsanta;

use secretsanta;

CREATE TABLE IF NOT EXISTS History (
	id_draw INT NOT NULL,
	name_participant VARCHAR(40),
  drawn_participant VARCHAR(40)
);
