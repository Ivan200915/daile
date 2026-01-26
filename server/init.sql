-- Enable UUID extension if needed (good for generic IDs, but we used SERIAL in plan, sticking to SERIAL for simplicity)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_data (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- 'logs', 'settings', 'habits'
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, data_type)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user ON user_data(user_id);
