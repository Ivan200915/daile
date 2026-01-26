import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error("No BOT_TOKEN");
    process.exit(1);
}

// Mock User Data
const userData = JSON.stringify({
    id: 123456789,
    first_name: "Ivan",
    last_name: "Dev",
    username: "ivandev",
    language_code: "en"
});

// Construct data-check-string (alphabetical order of keys)
const params = new URLSearchParams();
params.append('auth_date', Math.floor(Date.now() / 1000).toString());
params.append('query_id', 'AAE5GgUAAAAAAwuK7uA');
params.append('user', userData);

const dataCheckArr: string[] = [];
params.sort();
params.forEach((val, key) => dataCheckArr.push(`${key}=${val}`));
const dataCheckString = dataCheckArr.join('\n');

// Sign
const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

params.append('hash', hash);

console.log('Valid initData:');
console.log(params.toString());
