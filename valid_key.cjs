const https = require('https');

const API_KEY = 'tgp_v1_p07-GdUhsTheJu9ep8a9hxQLdXq0qyrZ1zwnsW1P6dE';

const options = {
    hostname: 'api.together.ai',
    path: '/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY.trim()}`
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('✅ Key is VALID.');
            const models = JSON.parse(body);
            console.log(`Found ${models.length} models.`);
            // Filter for vision models or the user's specific ones
            const interesting = models.filter(m =>
                m.name.includes('Llama-4') ||
                m.name.includes('Vision') ||
                m.name.includes('Qwen')
            );
            console.log('Relevant Models:', interesting.map(m => m.name));
        } else {
            console.log('❌ Key is INVALID or Rejected.');
            console.log('Response:', body);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
