const https = require('https');

const API_KEY = '5dbbb3a9d05d4fa35ac759a18e99bee8d05c905ea56860f499dbe35e36496e71';
const MODEL = 'meta-llama/Llama-Vision-Free';

const data = JSON.stringify({
    model: MODEL,
    messages: [
        {
            role: "user",
            content: "Hello, this is a test to verify API key and model availability. Respond with 'OK'."
        }
    ],
    max_tokens: 10
});

const options = {
    hostname: 'api.together.xyz',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response:', body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
