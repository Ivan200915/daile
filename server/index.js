import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PAYMENTS_TOKEN = process.env.PAYMENT_PROVIDER_TOKEN; // Tribute or other

if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
}

app.use(cors());
app.use(express.json());

// 1. Create Invoice Link
app.post('/api/create-invoice', async (req, res) => {
    try {
        const { title, description, payload, price, currency } = req.body;

        const isStars = currency === 'XTR';

        // For Stars (XTR), price is direct count. For fiat, it's cents.
        const amount = isStars ? price : price * 100;
        const prices = [{ label: title || 'Premium', amount: amount }];

        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
            title: title || 'Premium Subscription',
            description: description || 'Unlock all features',
            payload: payload || 'premium_upgrade',
            // For Stars, provider_token must be empty string
            provider_token: isStars ? '' : PAYMENTS_TOKEN,
            currency: currency || 'XTR',
            prices: prices,
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            is_flexible: false
        });

        if (response.data.ok) {
            res.json({ success: true, link: response.data.result });
        } else {
            console.error('Invoice Error:', response.data);
            res.status(500).json({ success: false, error: response.data.description });
        }

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to create invoice' });
    }
});

// 2. Webhook for Pre-Checkout & Payment Success
app.post('/api/webhook', async (req, res) => {
    const update = req.body;

    try {
        // A. Pre-Checkout Query (Must answer within 10 seconds)
        if (update.pre_checkout_query) {
            const queryId = update.pre_checkout_query.id;

            // Here you can validate order details/availability
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
                pre_checkout_query_id: queryId,
                ok: true
            });

            return res.sendStatus(200);
        }

        // B. Successful Payment
        if (update.message && update.message.successful_payment) {
            const payment = update.message.successful_payment;
            // const userId = update.message.from.id;

            console.log('Payment Successful:', payment);

            // TODO: Update user in database or notify frontend via socket/long-polling
            // For static app, we rely on the client refreshing or checking status
        }

    } catch (error) {
        console.error('Webhook Error:', error.message);
    }

    res.sendStatus(200);
});

// Health check
app.get('/api/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
