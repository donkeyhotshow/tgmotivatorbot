const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath);
    // Remove BOM if present (EF BB BF)
    if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
        content = content.slice(3);
    }
    // Also check for UTF-16 BOM
    if (content[0] === 0xFF && content[1] === 0xFE) {
        content = Buffer.from(content.toString('utf16le'), 'utf8');
    }
    
    let str = content.toString('utf8').trim();
    if (str === "" || str.includes("ï¿½")) {
        str = "[]";
    }
    
    fs.writeFileSync(filePath, str, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
}

fixFile('subscribers.json');
const quotesDir = 'quotes';
if (fs.existsSync(quotesDir)) {
    fs.readdirSync(quotesDir).forEach(f => fixFile(path.join(quotesDir, f)));
}
