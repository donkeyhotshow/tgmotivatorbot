require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const TOKEN = process.env.BOT_TOKEN;
const SUB_FILE = path.join(__dirname, "subscribers.json");
const QUOTES_DIR = path.join(__dirname, "quotes");
const HISTORY_DIR = path.join(__dirname, "history");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  if (!TOKEN) {
    console.error("❌ BOT_TOKEN is missing");
    process.exit(1);
  }

  if (!fs.existsSync(SUB_FILE)) {
    console.log("👤 Нет подписчиков");
    process.exit(0);
  }

  // Используем единый файл цитат
  const quotesFile = path.join(QUOTES_DIR, "quotes.json");
  if (!fs.existsSync(quotesFile)) throw new Error("quotes.json not found");

  const quotes = JSON.parse(fs.readFileSync(quotesFile));
  if (!quotes.length) throw new Error("Quotes file is empty");

  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR);

  const subscribers = JSON.parse(fs.readFileSync(SUB_FILE));
  console.log(`🚀 Начинаем рассылку для ${subscribers.length} пользователей...`);

  for (const chatId of subscribers) {
    // Храним историю для каждого пользователя в едином файле
    const histFile = path.join(HISTORY_DIR, `${chatId}.json`);
    let used = [];
    if (fs.existsSync(histFile)) used = JSON.parse(fs.readFileSync(histFile));
    
    let available = quotes.filter(q => !used.includes(q));
    // Если все цитаты использованы, сбрасываем историю
    if (!available.length) {
      console.log(`🔄 Сброс истории для пользователя ${chatId} (все цитаты показаны)`);
      used = [];
      available = [...quotes];
    }
    
    const quote = available[Math.floor(Math.random() * available.length)];
    
    try {
      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: quote,
        parse_mode: "HTML"
      });
      
      fs.writeFileSync(histFile, JSON.stringify([...used, quote], null, 2));
      console.log(`✅ Sent to ${chatId}`);
      
      // Задержка для соблюдения лимитов Telegram (30 сообщений в секунду)
      await sleep(100); 
    } catch (err) {
      console.error(`❌ Failed to send to ${chatId}:`, err.response?.data || err.message);
      
      // Если бот заблокирован пользователем, можно было бы удалять его из subscribers.json здесь
    }
  }
  
  console.log("🏁 Рассылка завершена.");
}

run();
