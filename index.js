const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.CHAT_ID;
const UZUM_API_KEY = process.env.UZUM_API_KEY;
const PRODUCT_ID = "380339";

const sendTelegramMessage = async (text) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });
};

const getReviews = async () => {
  const response = await fetch(`https://api.seller.uzum.uz/api/products/${PRODUCT_ID}/feedbacks`, {
    headers: { Authorization: `Bearer ${UZUM_API_KEY}` }
  });
  if (!response.ok) {
    console.error('Ошибка при получении отзывов');
    return null;
  }

  const data = await response.json();
  if (data?.content?.length) {
    const review = data.content[0];
    const message = `📦 <b>Новый отзыв</b>

⭐ Оценка: ${review.rating}
📝 Комментарий: ${review.text || 'Нет текста'}
👤 Автор: ${review.authorName}`;
    return message;
  }
  return null;
};

app.get('/', async (req, res) => {
  const reviewMessage = await getReviews();
  if (reviewMessage) {
    await sendTelegramMessage(reviewMessage);
    res.send('✅ Отзыв отправлен в Telegram');
  } else {
    res.send('❌ Не удалось получить отзыв');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
