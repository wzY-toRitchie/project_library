const fs = require('fs');
const c = fs.readFileSync('D:/Graduation Project/project_library/frontend/src/pages/Checkout.tsx', 'utf-8');
const lines = c.split('\n');
const line = lines[184]; // 0-indexed, so line 185
console.log('Line 185:', JSON.stringify(line));
console.log('Contains backtick:', line.includes('`'));
const chars = [...line];
chars.forEach((ch, i) => {
    const code = ch.charCodeAt(0);
    if (code > 127 || code === 0x60) {
        console.log(`  char[${i}]: '${ch}' (U+${code.toString(16).padStart(4, '0')})`);
    }
});
