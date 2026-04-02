const puppeteer = require('puppeteer');
const config = require('./config.cjs');

let browser;
let page;
let testResults = [];
let screenshotsDir;

async function setup() {
    browser = await puppeteer.launch({
        headless: config.HEADLESS ? 'new' : false,
        slowMo: config.SLOW_MO,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    page = await browser.newPage();
    await page.setViewport(config.VIEWPORT);
    await page.setDefaultTimeout(config.TIMEOUT);
    console.log('✅ Browser launched');
}

async function teardown() {
    if (browser) await browser.close();
    console.log('✅ Browser closed');
}

async function login(username, password) {
    await page.goto(`${config.BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#username', { timeout: config.TIMEOUT });
    await page.type('#username', username);
    await page.type('#password', password);
    const loginBtn = await page.$('button[type="submit"]');
    await loginBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: config.TIMEOUT });
}

async function registerUser(user) {
    await page.goto(`${config.BASE_URL}/register`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#username', { timeout: config.TIMEOUT });
    await page.type('#username', user.username);
    await page.type('#email', user.email);
    await page.type('#password', user.password);
    await page.type('#confirm-password', user.password);
    const termsCheckbox = await page.$('#terms');
    if (termsCheckbox) await termsCheckbox.click();
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: config.TIMEOUT });
}

async function screenshot(name) {
    const path = `./tests/screenshots/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`📸 Screenshot: ${path}`);
}

function report(testName, passed, message = '') {
    testResults.push({ test: testName, passed, message });
    if (passed) {
        console.log(`✅ PASS: ${testName}`);
    } else {
        console.log(`❌ FAIL: ${testName} - ${message}`);
    }
}

async function runTest(name, fn) {
    try {
        await fn();
        report(name, true);
    } catch (error) {
        report(name, false, error.message);
        try {
            await screenshot(`fail_${name.replace(/\s+/g, '_')}`);
        } catch (e) {
            console.log(`Failed to take screenshot: ${e.message}`);
        }
    }
}

function printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PUPPETEER E2E TEST REPORT');
    console.log('='.repeat(60));
    
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;
    
    console.log(`\nTotal: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.test}: ${r.message}`);
        });
    }
    
    console.log('\n✅ Passed Tests:');
    testResults.filter(r => r.passed).forEach(r => {
        console.log(`  - ${r.test}`);
    });
    
    console.log('\n' + '='.repeat(60));
}

module.exports = {
    setup,
    teardown,
    login,
    registerUser,
    screenshot,
    report,
    runTest,
    printReport,
    config,
    getBrowser: () => browser,
    getPage: () => page,
    getResults: () => testResults
};
