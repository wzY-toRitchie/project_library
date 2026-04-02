const p = require('puppeteer');
(async () => {
    const b = await p.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    pg.on('console', msg => { 
        if (msg.type() === 'error') console.log('ERROR:', msg.text().substring(0, 400)); 
    });
    
    // Test BookCard import
    const resp = await pg.goto('http://localhost:5173/src/components/BookCard.tsx', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('BookCard.tsx status:', resp.status());
    if (resp.status() !== 200) {
        const text = await pg.evaluate(() => document.body.innerText.substring(0, 500));
        console.log('Error response:', text);
    }
    
    // Test Rankings import
    const resp2 = await pg.goto('http://localhost:5173/src/components/home/Rankings.tsx', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Rankings.tsx status:', resp2.status());
    if (resp2.status() !== 200) {
        const text = await pg.evaluate(() => document.body.innerText.substring(0, 500));
        console.log('Error response:', text);
    }
    
    await b.close();
})().catch(e => console.error(e));
