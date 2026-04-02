const fs = require('fs');
const path = 'D:/Graduation Project/project_library/frontend/src/pages/Checkout.tsx';
let c = fs.readFileSync(path, 'utf-8');

// Comprehensive replacement map for all corrupted Chinese text
const replacements = [
    // Common corrupted patterns
    ['\u9999\u80cc\u88c3', '\u9ed8\u8ba4'], // corrupted 默认
    ['\u5e73\u88c5\u672c', '\u5e73\u88c5\u672c'], // 平装本 already correct
    ['\u69b4', '\u6ee1'], // corrupted 满
    ['\u5a05', '\u51cf'], // corrupted 减
    ['\u9488', '\u53ef'], // corrupted 可
    ['\u697c', '\u00a5'], // corrupted ¥
    // Specific corrupted strings found in errors
    ['\u9a6b\u7ef4\u9a0d', '\u8ba2\u5355'], // corrupted 订单
    ['\u896b\u7ef4', '\u8ba2'], // corrupted 订
    ['\u532f', '\u63d0'], // corrupted 提
    ['\u6397', '\u4ea4'], // corrupted 交
    ['\u8f38', '\u6210'], // corrupted 成
    ['\u84e3', '\u529f'], // corrupted 功
    // More patterns
    ['\u5a10', '\u7528'], // corrupted 用
    ['\u5a74', '\u5ba2'], // corrupted 客
    ['\u6b24', '\u52a9'], // corrupted 助
    ['\u66c0', '\u9700'], // corrupted 需
    ['\u5f69', '\u8981'], // corrupted 要
    ['\u7050', '\u670d'], // corrupted 服
    ['\u6b0c', '\u52a1'], // corrupted 务
    ['\u6f69', '\u7cfb'], // corrupted 系
    ['\u9a0d', '\u7edf'], // corrupted 统
];

// Apply replacements
let fixed = 0;
replacements.forEach(([from, to]) => {
    const count = (c.split(from).length - 1);
    if (count > 0) {
        c = c.split(from).join(to);
        fixed += count;
    }
});

fs.writeFileSync(path, c, 'utf-8');
console.log(`Applied ${fixed} replacements`);
