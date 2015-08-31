CREATE DATABASE newapi;
CREATE USER 'newapi'@'localhost' identified by 'newapi';
GRANT ALL PRIVILEGES ON newapi.* to 'newapi'@'localhost':
FLUSH PRIVILEGES;
