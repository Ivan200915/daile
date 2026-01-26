import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

dotenv.config();

// Fix for Timeweb Self-Signed Certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large payloads for sync

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Test DB Connection
pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch(err => console.error('❌ Database connection error:', err));

// --- Auth Routes ---

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Telegram Auth
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { initData } = req.body;
        if (!initData || !BOT_TOKEN) return res.status(400).json({ error: 'Missing data or token config' });

        // Parse and Verify Signature
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');

        // Create data-check-string
        const dataCheckArr: string[] = [];
        urlParams.sort();
        urlParams.forEach((val, key) => dataCheckArr.push(`${key}=${val}`));
        const dataCheckString = dataCheckArr.join('\n');

        // Calculate HMAC
        const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
        const signature = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

        if (signature !== hash) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        // Auth Successful
        const userJson = urlParams.get('user');
        if (!userJson) return res.status(400).json({ error: 'No user data' });

        const telegramUser = JSON.parse(userJson);
        const telegramId = telegramUser.id;

        // Find or Create User
        let result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
        let user = result.rows[0];

        if (!user) {
            // Create new user (Generate random password for schema compliance if needed, or null)
            result = await pool.query(
                `INSERT INTO users (telegram_id, email, password_hash) 
                 VALUES ($1, $2, $3) RETURNING id`,
                [telegramId, `tg_${telegramId}@telegram.fake`, 'tg_auth_no_pass']
            );
            user = result.rows[0];
        }

        const token = jwt.sign({ id: user.id, telegram_id: telegramId }, JWT_SECRET, { expiresIn: '60d' });
        res.json({ token, user: { id: user.id, telegramId } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register (Legacy/Backup)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, hash]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err: any) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'User already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Data Routes ---

// Middleware to verify token
const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Sync Data (Push/Pull)
app.post('/api/sync', authMiddleware, async (req: any, res) => {
    try {
        // req.body should contain { updates: { logs: ..., settings: ... } }
        // or just accept full objects for "Last Write Wins" simple strategy first
        const userId = req.user.id;
        const { settings, logs, habits, lastSyncedAt } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const now = new Date();

            // Save Settings
            if (settings) {
                await client.query(
                    `INSERT INTO user_data (user_id, data_type, data, updated_at) 
                     VALUES ($1, 'settings', $2, $3)
                     ON CONFLICT (user_id, data_type) 
                     DO UPDATE SET data = $2, updated_at = $3`,
                    [userId, settings, now]
                );
            }

            // Save Logs (This might be large, ideally we sync only changed days, but for MVP full sync)
            if (logs) {
                await client.query(
                    `INSERT INTO user_data (user_id, data_type, data, updated_at) 
                     VALUES ($1, 'logs', $2, $3)
                     ON CONFLICT (user_id, data_type) 
                     DO UPDATE SET data = $2, updated_at = $3`,
                    [userId, logs, now]
                );
            }

            // Save Habits
            if (habits) {
                await client.query(
                    `INSERT INTO user_data (user_id, data_type, data, updated_at) 
                     VALUES ($1, 'habits', $2, $3)
                     ON CONFLICT (user_id, data_type) 
                     DO UPDATE SET data = $2, updated_at = $3`,
                    [userId, habits, now]
                );
            }

            // If client wants to PULL, we can return latest data here
            // distinct from what was just saved if we implement clever merging.
            // For now, simpler: Accept Push. Return Success. 
            // Real 2-way sync requires checking `updated_at` etc.

            await client.query('COMMIT');
            res.json({ success: true, timestamp: now.toISOString() });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// Load Data (Pull)
app.get('/api/sync', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT data_type, data FROM user_data WHERE user_id = $1', [userId]);

        const response: any = {};
        result.rows.forEach(row => {
            response[row.data_type] = row.data;
        });

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Load failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
