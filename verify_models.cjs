const https = require('https');

const API_KEY = '5dbbb3a9d05d4fa35ac759a18e99bee8d05c905ea56860f499dbe35e36496e71';

// Candidate models based on user input and standard naming conventions
const MODELS_TO_TEST = [
    'meta-llama/Llama-Vision-Free',
    'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
    'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
    'meta-llama/Llama-4-Maverick-Instruct', // Guessing slug
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct', // Based on user text
    'Qwen/Qwen2-VL-72B-Instruct',
    'Qwen/Qwen2-VL-7B-Instruct',
    'Qwen/Qwen3-VL-8B-Instruct' // From user text
];

async function checkModel(model) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "test" }],
            max_tokens: 1
        });

        const options = {
            hostname: 'api.together.ai',
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
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS: ${model}`);
                    resolve(true);
                } else {
                    console.log(`❌ FAILED: ${model} (${res.statusCode})`);
                    // Create a very brief summary of error to avoid clutter
                    try {
                        const err = JSON.parse(body);
                        console.log(`   -> ${err.error?.message?.split('.')[0]}`);
                    } catch (e) { }
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`⚠️ NETWORK ERROR: ${model}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log("Starting Model Verification...");
    for (const model of MODELS_TO_TEST) {
        await checkModel(model);
    }
    console.log("Verification Complete.");
}

run();
