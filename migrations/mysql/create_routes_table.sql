USE newapi;
CREATE TABLE routes (
  id bigint primary key auto_increment,
  route varchar(250) UNIQUE NOT NULL,
  minLvl INT NOT NULL
);

INSERT INTO routes (route, minLvl) VALUES ('/api', 0);
INSERT INTO routes (route, minLvl) VALUES ('/api/v1', 0);
INSERT INTO routes (route, minLvl) VALUES ('/api/v1/user/*', 0);
