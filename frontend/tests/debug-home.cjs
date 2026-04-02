const p = require('puppeteer');
(async () => {
    const b = await p.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    pg.on('pageerror', err => console.log('PAGE ERROR:', err.message.substring(0, 300)));
    pg.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE:', msg.text().substring(0, 200)); });
    
    // Test direct module fetch
    const resp = await pg.goto('http://localhost:5173/src/pages/Home.tsx', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Home.tsx status:', resp.status());
    const body = await pg.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Home.tsx response:', body.substring(0, 300));
    
    await b.close();
})().catch(e => console.error(e));
