const https = require('https');

const API_KEY = '5dbbb3a9d05d4fa35ac759a18e99bee8d05c905ea56860f499dbe35e36496e71';
const MODEL = 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8';

const data = JSON.stringify({
    model: MODEL,
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "What is in this image?"
                },
                {
                    type: "image_url",
                    image_url: {
                        url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
                    }
                }
            ]
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
