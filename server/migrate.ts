import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Fix for Timeweb Self-Signed Certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Timeweb uses self-signed often, or standard SSL
});

async function migrate() {
    try {
        console.log('🔌 Connecting to Timeweb Database...');
        const client = await pool.connect();
        console.log('✅ Connected.');

        const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        console.log('📝 Executing init.sql...');

        await client.query(sql);
        console.log('✅ Migration successful! Tables created.');

        client.release();
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
