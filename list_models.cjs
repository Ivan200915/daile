const https = require('https');

const API_KEY = '5dbbb3a9d05d4fa35ac759a18e99bee8d05c905ea56860f499dbe35e36496e71';

const options = {
    hostname: 'api.together.xyz',
    path: '/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            // Filter for vision models or print all names
            const models = data.map(m => m.id).sort();
            console.log('Available Models:', JSON.stringify(models, null, 2));
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw body:', body);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
