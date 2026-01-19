const fs = require('fs');
const path = require('path');

const files = ['subscribers.json'];
// Также проверим файлы в quotes, хотя они вроде созданы через node
const quotesDir = path.join(__dirname, 'quotes');
if (fs.existsSync(quotesDir)) {
    fs.readdirSync(quotesDir).forEach(file => {
        files.push(path.join('quotes', file));
    });
}

files.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        // Перезаписываем строго в UTF-8 без BOM
        fs.writeFileSync(file, content, { encoding: 'utf8' });
        console.log(`✅ Fixed encoding for: ${file}`);
    }
});
