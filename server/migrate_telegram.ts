import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Fix for Timeweb Self-Signed Certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('🔌 Connecting to Database...');
        const client = await pool.connect();

        console.log('📝 Adding telegram_id to users...');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;
            ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
            ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
        `);

        console.log('✅ Migration successful!');
        client.release();
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
