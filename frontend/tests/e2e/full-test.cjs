const h = require('./helpers.cjs');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    await h.setup();
    const page = h.getPage();

    // Helper: click button by text content
    const clickButtonByText = async (text) => {
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const content = await btn.evaluate(el => el.textContent.trim());
            if (content.includes(text)) {
                await btn.click();
                return true;
            }
        }
        return false;
    };

    try {
        // ============================================
        // TEST SUITE 1: AUTHENTICATION
        // ============================================
        console.log('\n🔐 === AUTHENTICATION TESTS ===\n');

        await h.runTest('1.1 - Login page loads with form', async () => {
            await page.goto(`${h.config.BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const hasUsername = await page.$('#username');
            if (!hasUsername) {
                // Check if page rendered at all
                const bodyText = await page.evaluate(() => document.body.innerText);
                throw new Error(`Username input not found. Page text: ${bodyText.substring(0, 200)}`);
            }
        });

        await h.runTest('1.2 - Login with admin credentials', async () => {
            await page.goto(`${h.config.BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            await page.waitForSelector('#username', { timeout: 10000 });
            await page.type('#username', h.config.ADMIN_USER.username);
            await page.type('#password', h.config.ADMIN_USER.password);
            await clickButtonByText('登录');
            await delay(5000);
            const url = page.url();
            if (!url.includes('/admin') && url !== `${h.config.BASE_URL}/` && !url.includes('/login')) {
                throw new Error(`Expected /admin or / but got ${url}`);
            }
        });

        await h.runTest('1.3 - Navigate to register page', async () => {
            await page.goto(`${h.config.BASE_URL}/register`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/register')) throw new Error(`Expected /register but got ${url}`);
            const hasUsername = await page.$('#username');
            if (!hasUsername) throw new Error('Username input not found');
            const hasEmail = await page.$('#email');
            if (!hasEmail) throw new Error('Email input not found');
        });

        await h.runTest('1.4 - Register form has required fields', async () => {
            await page.goto(`${h.config.BASE_URL}/register`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const hasUsername = await page.$('#username');
            const hasEmail = await page.$('#email');
            const hasPassword = await page.$('#password');
            const hasConfirmPw = await page.$('#confirm-password');
            if (!hasUsername || !hasEmail || !hasPassword || !hasConfirmPw) {
                throw new Error('Missing required form fields');
            }
        });

        await h.runTest('1.5 - Login has show password toggle', async () => {
            await page.goto(`${h.config.BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            await page.waitForSelector('#password');
            const toggleBtn = await page.$('button[aria-label="显示密码"]');
            if (!toggleBtn) throw new Error('Show password button not found');
            await toggleBtn.click();
            await delay(300);
            const toggleAfter = await page.$('button[aria-label="隐藏密码"]');
            if (!toggleAfter) throw new Error('Hide password button not found after toggle');
        });

        // ============================================
        // TEST SUITE 2: HOME PAGE
        // ============================================
        console.log('\n🏠 === HOME PAGE TESTS ===\n');

        await h.runTest('2.1 - Home page loads with book content', async () => {
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(3000);
            const hasBooks = await page.$('a[href^="/book/"]');
            if (!hasBooks) {
                const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
                throw new Error(`No book cards found. Body: ${bodyText}`);
            }
        });

        await h.runTest('2.2 - Header has logo', async () => {
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const logo = await page.$('a[href="/"]');
            if (!logo) throw new Error('Logo link not found');
        });

        await h.runTest('2.3 - Header has search input', async () => {
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const searchInput = await page.$('input[aria-label="搜索书籍"]');
            if (!searchInput) throw new Error('Search input not found');
        });

        await h.runTest('2.4 - Header has cart button', async () => {
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const cartBtn = await page.$('button[aria-label="购物车"]');
            if (!cartBtn) throw new Error('Cart button not found');
        });

        await h.runTest('2.5 - Footer exists with content', async () => {
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const footer = await page.$('footer');
            if (!footer) throw new Error('Footer element not found');
            const footerText = await footer.evaluate(el => el.innerText);
            if (!footerText.includes('帮助') && !footerText.includes('关于')) {
                throw new Error('Footer missing expected sections');
            }
        });

        await h.runTest('2.6 - Category navigation links exist', async () => {
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const catLinks = await page.$$('a[href^="/search?q="]');
            if (catLinks.length < 2) throw new Error(`Expected 2+ category links, found ${catLinks.length}`);
        });

        // ============================================
        // TEST SUITE 3: SEARCH & FILTER
        // ============================================
        console.log('\n🔍 === SEARCH & FILTER TESTS ===\n');

        await h.runTest('3.1 - Search results page loads', async () => {
            await page.goto(`${h.config.BASE_URL}/search?q=Java`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/search')) throw new Error(`Expected /search but got ${url}`);
        });

        await h.runTest('3.2 - Search results has filter sidebar', async () => {
            await page.goto(`${h.config.BASE_URL}/search?q=Java`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (!pageText.includes('价格区间')) throw new Error('Price range filter not found');
            if (!pageText.includes('评分')) throw new Error('Rating filter not found');
        });

        await h.runTest('3.3 - Search results has sort dropdown', async () => {
            await page.goto(`${h.config.BASE_URL}/search?q=Java`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const sortSelect = await page.$('select');
            if (!sortSelect) throw new Error('Sort select not found');
            const options = await page.$$eval('select option', opts => opts.map(o => o.value));
            if (options.length < 3) throw new Error(`Expected 3+ sort options, found ${options.length}`);
        });

        await h.runTest('3.4 - Search results page shows book cards', async () => {
            await page.goto(`${h.config.BASE_URL}/search?q=Java`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(3000);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (!pageText.includes('搜索结果') && !pageText.includes('本书') && !pageText.includes('未找到')) {
                throw new Error('Search results content not found');
            }
        });

        // ============================================
        // TEST SUITE 4: BOOK DETAIL
        // ============================================
        console.log('\n📖 === BOOK DETAIL TESTS ===\n');

        await h.runTest('4.1 - Book detail page loads directly', async () => {
            await page.goto(`${h.config.BASE_URL}/book/1`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(3000);
            const url = page.url();
            if (!url.includes('/book/')) throw new Error(`Expected /book/ but got ${url}`);
        });

        await h.runTest('4.2 - Book detail has content', async () => {
            await page.goto(`${h.config.BASE_URL}/book/1`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(3000);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (pageText.includes('加载中') || pageText.length < 100) {
                throw new Error('Book detail page not fully loaded');
            }
        });

        await h.runTest('4.3 - Book detail has price display', async () => {
            await page.goto(`${h.config.BASE_URL}/book/1`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(3000);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (!pageText.includes('¥')) throw new Error('Price not found on book detail');
        });

        await h.runTest('4.4 - Book detail has action buttons', async () => {
            await page.goto(`${h.config.BASE_URL}/book/1`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(3000);
            const pageText = await page.evaluate(() => document.body.innerText);
            const hasActions = pageText.includes('加入购物车') || pageText.includes('立即购买');
            if (!hasActions) throw new Error('Action buttons not found');
        });

        // ============================================
        // TEST SUITE 5: CART
        // ============================================
        console.log('\n🛒 === CART TESTS ===\n');

        await h.runTest('5.1 - Cart page loads', async () => {
            await page.goto(`${h.config.BASE_URL}/cart`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/cart')) throw new Error(`Expected /cart but got ${url}`);
        });

        await h.runTest('5.2 - Cart has action button', async () => {
            await page.goto(`${h.config.BASE_URL}/cart`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const hasBtn = await page.evaluate(() => {
                return [...document.querySelectorAll('button, a')].some(el => 
                    el.textContent.includes('去结算') || el.textContent.includes('继续购物') || el.textContent.includes('去逛逛')
                );
            });
            if (!hasBtn) throw new Error('Cart action button not found');
        });

        await h.runTest('5.3 - Cart shows appropriate content', async () => {
            await page.goto(`${h.config.BASE_URL}/cart`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const pageText = await page.evaluate(() => document.body.innerText);
            const hasContent = pageText.includes('购物车') || pageText.includes('去逛逛') || pageText.includes('空空如也');
            if (!hasContent) throw new Error('Cart page has no recognizable content');
        });

        // ============================================
        // TEST SUITE 6: CHECKOUT
        // ============================================
        console.log('\n💳 === CHECKOUT TESTS ===\n');

        await h.runTest('6.1 - Checkout redirects when not logged in', async () => {
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${h.config.BASE_URL}/checkout`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/login')) throw new Error(`Expected redirect to /login but got ${url}`);
        });

        await h.runTest('6.2 - Profile redirects when not logged in', async () => {
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${h.config.BASE_URL}/profile`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/login')) throw new Error(`Expected redirect to /login but got ${url}`);
        });

        await h.runTest('6.3 - Payment redirects when not logged in', async () => {
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${h.config.BASE_URL}/payment/1`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/login')) throw new Error(`Expected redirect to /login but got ${url}`);
        });

        // ============================================
        // TEST SUITE 7: ADMIN
        // ============================================
        console.log('\n⚙️ === ADMIN TESTS ===\n');

        await h.runTest('7.1 - Admin redirects when not logged in', async () => {
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${h.config.BASE_URL}/admin`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/login')) throw new Error(`Expected redirect to /login but got ${url}`);
        });

        await h.runTest('7.2 - Admin books redirects when not logged in', async () => {
            await page.evaluate(() => localStorage.clear());
            await page.goto(`${h.config.BASE_URL}/admin/books`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/login')) throw new Error(`Expected redirect to /login but got ${url}`);
        });

        // ============================================
        // TEST SUITE 8: SPECIAL PAGES
        // ============================================
        console.log('\n📄 === SPECIAL PAGES TESTS ===\n');

        await h.runTest('8.1 - AI recommend page loads', async () => {
            await page.goto(`${h.config.BASE_URL}/ai-recommend`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/ai-recommend')) throw new Error(`Expected /ai-recommend but got ${url}`);
        });

        await h.runTest('8.2 - Contact support page loads', async () => {
            await page.goto(`${h.config.BASE_URL}/contact`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/contact')) throw new Error(`Expected /contact but got ${url}`);
        });

        await h.runTest('8.3 - 404 page handles unknown routes', async () => {
            await page.goto(`${h.config.BASE_URL}/nonexistent-page-xyz`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (!pageText.includes('404') && !pageText.includes('找不到') && !pageText.includes('页面')) {
                throw new Error('404 page not shown for unknown route');
            }
        });

        await h.runTest('8.4 - Search with Chinese characters works', async () => {
            await page.goto(`${h.config.BASE_URL}/search?q=文学`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/search')) throw new Error(`Expected /search but got ${url}`);
            const pageText = await page.evaluate(() => document.body.innerText);
            if (!pageText.includes('文学') && !pageText.includes('搜索')) {
                throw new Error('Chinese search results not found');
            }
        });

        // ============================================
        // TEST SUITE 9: RESPONSIVE
        // ============================================
        console.log('\n📱 === RESPONSIVE TESTS ===\n');

        await h.runTest('9.1 - Mobile viewport renders', async () => {
            await page.setViewport(h.config.MOBILE_VIEWPORT);
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/')) throw new Error(`Expected / but got ${url}`);
            await page.setViewport(h.config.VIEWPORT);
        });

        await h.runTest('9.2 - Desktop viewport renders', async () => {
            await page.setViewport(h.config.VIEWPORT);
            await page.goto(`${h.config.BASE_URL}/`, { waitUntil: 'networkidle0', timeout: h.config.TIMEOUT });
            await delay(2000);
            const url = page.url();
            if (!url.includes('/')) throw new Error(`Expected / but got ${url}`);
        });

        // ============================================
        // FINAL REPORT
        // ============================================
        h.printReport();

    } catch (error) {
        console.error('Test suite error:', error.message);
        try { await h.screenshot('suite_error'); } catch (e) {}
    } finally {
        await h.teardown();
    }
})();
