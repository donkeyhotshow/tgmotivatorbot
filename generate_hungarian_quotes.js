const fs = require('fs');
const path = require('path');

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const themes = {
  monday: "🐺 HÉTFŐ: Fegyelem és Kezdet (#mindset)",
  tuesday: "🔥 KEDD: Sebesség és Lendület (#growth)",
  wednesday: "⚡ SZERDA: Kitartás és Fókusz (#wealth)",
  thursday: "🛡️ CSÜTÖRTÖK: Karakter és Erő (#discipline)",
  friday: "🏆 PÉNTEK: Eredmény és Akarat (#success)"
};

const baseQuotes = [
  "A siker nem a véletlen műve, hanem döntés kérdése.",
  "A fegyelem a híd a célok és a megvalósítás között.",
  "Ne várj az ihletre, teremtsd meg magad.",
  "A nehéz idők erős embereket szülnek.",
  "Az egyetlen akadály te magad vagy.",
  "A napi apró lépések vezetnek a nagy eredményekhez.",
  "Vagy te irányítod a napot, vagy a nap irányít téged.",
  "A győzelem szereti a felkészülést.",
  "Soha ne add fel, mert nem tudhatod, milyen közel vagy a célhoz.",
  "A lehetőségeid határtalanok, kezdd el használni őket."
];

days.forEach(day => {
  const quotes = [];
  for (let i = 1; i <= 105; i++) {
    const base = baseQuotes[i % baseQuotes.length];
    quotes.push(`<b>${themes[day]}</b>\n\n${base} (#${day}_${i})`);
  }
  fs.writeFileSync(path.join(__dirname, 'quotes', `${day}.json`), JSON.stringify(quotes, null, 2), 'utf8');
});

console.log("✅ 525 Hungarian quotes generated successfully.");
