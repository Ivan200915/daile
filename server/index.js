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

        // C. Bot Commands
        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            const userId = update.message.from.id;

            // /start command
            if (text.startsWith('/start')) {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `👋 Привет! Я Daily Discipline Bot.\n\n🎯 Открой приложение, чтобы начать отслеживать привычки:\nhttps://t.me/DailyDisciplin_bot/app\n\nКоманды:\n/stats - статистика за неделю\n/today - прогресс сегодня\n/streak - текущий стрик\n/help - все команды`,
                    parse_mode: 'HTML'
                });
            }

            // /help command
            if (text === '/help') {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `📋 <b>Доступные команды:</b>\n\n/stats - 📊 Статистика за неделю\n/today - ✅ Прогресс сегодня\n/streak - 🔥 Текущий стрик\n/premium - ⭐ Улучшить подписку\n/help - ❓ Эта справка\n\n🎯 Открыть приложение:\nhttps://t.me/DailyDisciplin_bot/app`,
                    parse_mode: 'HTML'
                });
            }

            // /stats command
            if (text === '/stats') {
                // TODO: Fetch real stats from database
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `📊 <b>Твоя статистика за неделю:</b>\n\n✅ Закрыто дней: 5/7\n💪 Привычек выполнено: 28\n🍽️ Приёмов пищи: 14\n⚡ Средняя энергия: 7.2/10\n\n🎯 Открой приложение для деталей:\nhttps://t.me/DailyDisciplin_bot/app`,
                    parse_mode: 'HTML'
                });
            }

            // /today command
            if (text === '/today') {
                const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
                // TODO: Fetch real today's data
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `📅 <b>${today}</b>\n\n🎯 Привычки: 3/5 выполнено\n🍽️ Еда: 2 приёма залогировано\n👟 Шаги: 4,230\n😴 Сон: 7.5ч\n\n✅ Открой приложение, чтобы закрыть день:\nhttps://t.me/DailyDisciplin_bot/app`,
                    parse_mode: 'HTML'
                });
            }

            // /streak command
            if (text === '/streak') {
                // TODO: Fetch real streak data
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `🔥 <b>Твой стрик:</b>\n\n🔥 Текущий: 7 дней\n🏆 Лучший: 14 дней\n❄️ Заморозок: 2\n\n💪 Продолжай в том же духе!\nhttps://t.me/DailyDisciplin_bot/app`,
                    parse_mode: 'HTML'
                });
            }

            // /premium command
            if (text === '/premium') {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `⭐ <b>Daily Discipline Premium</b>\n\n✅ AI-коуч и персональные инсайты\n✅ Полная история без ограничений\n✅ Продвинутая аналитика\n✅ Приоритетная поддержка\n\n💳 Улучшить подписку:\nhttps://web.tribute.tg/p/pXj`,
                    parse_mode: 'HTML'
                });
            }
        }

    } catch (error) {
        console.error('Webhook Error:', error.message);
    }

    res.sendStatus(200);
});

// 3. AI Food Analysis Proxy (Bypass CORS/ISP blocks)
app.post('/api/analyze-food', async (req, res) => {
    try {
        const { model, messages } = req.body;

        // Use hardcoded key for reliability if env var fails
        const API_KEY = process.env.TOGETHER_API_KEY || '5dbbb3a9d05d4fa35ac759a18e99bee8d05c905ea56860f499dbe35e36496e71';

        const response = await axios.post('https://api.together.ai/v1/chat/completions', {
            model,
            messages,
            max_tokens: 1024,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);

    } catch (error) {
        console.error('AI Proxy Error:', error.response?.data || error.message);

        // Pass through the upstream error
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: { message: "Internal Server Error during AI proxy" } });
        }
    }
});

// Health check
app.get('/api/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
