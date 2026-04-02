const p = require('puppeteer');
(async () => {
    const b = await p.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    pg.on('pageerror', err => console.log('PAGE ERROR:', err.message.substring(0, 500)));
    pg.on('console', msg => {
        if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text().substring(0, 500));
    });
    
    // First test: direct fetch of Login.tsx
    const resp = await pg.goto('http://localhost:5173/src/pages/Login.tsx', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Login.tsx status:', resp.status());
    
    // Second test: navigate to login
    await pg.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    const el = await pg.$('#username');
    console.log(el ? 'Login page: OK' : 'Login page: FAIL');
    const bodyText = await pg.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('Body:', bodyText);
    
    await b.close();
})().catch(e => console.error(e));
