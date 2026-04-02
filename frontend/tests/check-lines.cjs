const fs = require('fs');
const c = fs.readFileSync('D:/Graduation Project/project_library/frontend/src/pages/Checkout.tsx', 'utf-8');
const lines = c.split('\n');
// Check lines 180-190 for non-ASCII
for (let i = 179; i <= 190; i++) {
    const line = lines[i];
    const nonAscii = [...line].filter(ch => ch.charCodeAt(0) > 127).map(ch => `U+${ch.charCodeAt(0).toString(16).padStart(4,'0')}`);
    if (nonAscii.length > 0) {
        console.log(`Line ${i+1}: has ${nonAscii.length} non-ASCII chars: ${nonAscii.join(', ')}`);
        console.log(`  Content: ${JSON.stringify(line.trim())}`);
    }
}
