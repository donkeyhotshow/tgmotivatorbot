require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Telegraf } = require("telegraf");

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ BOT_TOKEN is not defined in .env");
  process.exit(1);
}

const bot = new Telegraf(TOKEN);

const SUB_FILE = path.join(__dirname, "subscribers.json");
const QUOTES_DIR = path.join(__dirname, "quotes");
const HISTORY_DIR = path.join(__dirname, "history");

if (!fs.existsSync(SUB_FILE)) fs.writeFileSync(SUB_FILE, JSON.stringify([]));
if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR);

function saveSubscriber(chatId) {
  const subs = JSON.parse(fs.readFileSync(SUB_FILE));
  if (!subs.includes(chatId)) {
    subs.push(chatId);
    fs.writeFileSync(SUB_FILE, JSON.stringify(subs, null, 2));
    return true;
  }
  return false;
}

function getQuoteForUser(chatId) {
  const quotesPath = path.join(QUOTES_DIR, "quotes.json");
  if (!fs.existsSync(quotesPath)) return null;

  const quotes = JSON.parse(fs.readFileSync(quotesPath));
  if (!quotes.length) return null;

  const histFile = path.join(HISTORY_DIR, `${chatId}.json`);
  let used = [];
  if (fs.existsSync(histFile)) used = JSON.parse(fs.readFileSync(histFile));

  let available = quotes.filter(q => !used.includes(q));
  if (!available.length) {
    used = [];
    available = [...quotes];
  }

  const quote = available[Math.floor(Math.random() * available.length)];
  
  // Сохраняем в историю
  used.push(quote);
  fs.writeFileSync(histFile, JSON.stringify(used, null, 2));
  
  return quote;
}

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  const isNew = saveSubscriber(chatId);
  ctx.replyWithHTML(isNew 
    ? "<b>Вы подписаны на цитаты! ✅</b>\nТеперь вы будете получать мотивацию 5 раз в день." 
    : "Вы уже подписаны! Ждите следующую порцию мотивации. 🔥");
});

// Ответ цитатой на любое сообщение
bot.on("message", (ctx) => {
  // Игнорируем команды, так как они обрабатываются отдельно
  if (ctx.message.text && ctx.message.text.startsWith("/")) return;

  const quote = getQuoteForUser(ctx.chat.id);
  if (quote) {
    ctx.replyWithHTML(quote);
  } else {
    ctx.reply("Цитаты временно недоступны. 😔");
  }
});

bot.command("test", (ctx) => {
  const quote = getQuoteForUser(ctx.chat.id);
  if (quote) {
    ctx.replyWithHTML(quote);
  } else {
    ctx.reply("Цитаты пока не загружены.");
  }
});

bot.launch().then(() => {
  console.log("🚀 Bot is running...");
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
