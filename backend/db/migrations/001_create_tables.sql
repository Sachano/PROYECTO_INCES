-- Initial schema for INCES app
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  cedula TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT,
  status TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  notifications JSONB
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cedula ON users(cedula);
