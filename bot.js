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

if (!fs.existsSync(SUB_FILE)) fs.writeFileSync(SUB_FILE, JSON.stringify([]));

function saveSubscriber(chatId) {
  const subs = JSON.parse(fs.readFileSync(SUB_FILE));
  if (!subs.includes(chatId)) {
    subs.push(chatId);
    fs.writeFileSync(SUB_FILE, JSON.stringify(subs, null, 2));
    return true;
  }
  return false;
}

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  const isNew = saveSubscriber(chatId);
  ctx.replyWithHTML(isNew 
    ? "<b>Вы подписаны на цитаты! ✅</b>\nТеперь вы будете получать мотивацию 5 раз в день." 
    : "Вы уже подписаны! Ждите следующую порцию мотивации. 🔥");
});

bot.command("test", (ctx) => {
  const weekday = new Date().toLocaleString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase();
  const quotesPath = path.join(QUOTES_DIR, `${weekday}.json`);
  
  if (!fs.existsSync(quotesPath)) return ctx.reply("Цитаты пока не загружены.");
  
  const quotes = JSON.parse(fs.readFileSync(quotesPath));
  if (!quotes.length) return ctx.reply("Цитаты пусты.");
  
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  ctx.replyWithHTML(quote);
});

bot.launch().then(() => {
  console.log("🚀 Bot is running...");
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
