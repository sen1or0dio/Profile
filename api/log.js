export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

  let location = 'Неизвестно';
  if (ip !== 'unknown' && ip !== '127.0.0.1') {
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoRes.json();
      if (!geoData.error && geoData.city) {
        location = `${geoData.city}, ${geoData.region}, ${geoData.country_name}`;
      } else if (geoData.country_name) {
        location = `Страна: ${geoData.country_name}`;
      }
    } catch (e) {
      console.error('Geo error:', e);
    }
  }

  const message = `🆕 Новый посетитель!\nIP: ${ip}\n📍 Местоположение: ${location}\n🕒 ${new Date().toLocaleString('ru-RU')}`;

  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message
    })
  });

  res.status(200).json({ ok: true });
}



