-- Postgres initialization script

CREATE DATABASE gtechlab;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE gtechlab TO postgres;
