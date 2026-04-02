module.exports = {
    BASE_URL: 'http://localhost:5173',
    API_URL: 'http://localhost:8080/api',
    TIMEOUT: 30000,
    SLOW_MO: 50,
    HEADLESS: true,
    VIEWPORT: { width: 1280, height: 720 },
    MOBILE_VIEWPORT: { width: 375, height: 667 },
    TEST_USER: {
        username: 'testuser_e2e',
        email: 'testuser_e2e@example.com',
        password: 'Testuser@123',
        phone: '13800138000'
    },
    ADMIN_USER: {
        username: 'admin',
        password: 'Admin@123'
    }
};
