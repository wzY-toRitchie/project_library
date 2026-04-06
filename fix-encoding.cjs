const fs = require('fs');
const path = 'D:/Graduation Project/project_library/frontend/src/pages/Checkout.tsx';
let c = fs.readFileSync(path, 'utf-8');
const fixes = [
  ['\u9999\u80cc\u88c3', '\u9ed8\u8ba4'], // 榛樿->默认
  ['\u6570\u91cf:', '\u6570\u91cf:'], // 鏁伴噺:->数量:
  ['\u8ba2\u5355\u5546\u54c1', '\u8ba2\u5355\u5546\u54c1'], // 订单商品
  ['\u8ba2\u5355\u6458\u8981', '\u8ba2\u5355\u6458\u8981'], // 订单摘要
  ['\u8ba2\u5355\u603b\u8ba1', '\u8ba2\u5355\u603b\u8ba1'], // 订单总计
  ['\u9700\u8981\u5e2e\u52a9\uff1f', '\u9700\u8981\u5e2e\u52a9\uff1f'], // 需要帮助？
  ['\u8fd8\u9700', '\u8fd8\u9700'], // 还需
  ['\u53ef\u7528', '\u53ef\u7528'], // 可用
];
// Just replace the known corrupted substrings
const corrupted = [
  '\u69b4\u6b64\u88c3', // corrupted 默认
  '\u5e73\u88c5\u672c', // corrupted 平装本
  '\u6570\u91cf', // corrupted 数量
  '\u8ba2\u5355\u6458\u8981', // corrupted 订单摘要
  '\u8ba2\u5355\u603b\u8ba1', // corrupted 订单总计
  '\u9700\u8981\u5e2e\u52a9', // corrupted 需要帮助
];
// Read all lines and log those with potential issues
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('\u69b4') || l.includes('\u5e73\u88c5') || l.includes('\u9999')) {
    console.log('Line ' + (i+1) + ': ' + l.trim().substring(0, 120));
  }
});
