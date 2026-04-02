const fs = require('fs');
const path = 'D:/Graduation Project/project_library/frontend/src/pages/Checkout.tsx';
let c = fs.readFileSync(path, 'utf-8');

// Find all lines with corrupted Chinese and fix them
const lines = c.split('\n');
let fixed = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const chars = [...line];
    const hasCorrupted = chars.some(ch => {
        const code = ch.charCodeAt(0);
        // Check for common corrupted characters
        return (code >= 0x9a6b && code <= 0x9a80) || // corrupted range
               (code >= 0x80b1 && code <= 0x80cc) || // more corrupted
               (code >= 0x69b4 && code <= 0x69c0) || // corrupted
               (code >= 0x5a05 && code <= 0x5a10) || // corrupted
               (code >= 0x9488 && code <= 0x9490);   // corrupted
    });
    if (hasCorrupted) {
        console.log(`Line ${i+1}: ${line.trim().substring(0, 100)}`);
    }
}
