const fs = require('fs');
const path = 'D:/Graduation Project/project_library/frontend/src/pages/Checkout.tsx';
let c = fs.readFileSync(path, 'utf-8');

// Fix all remaining corrupted strings
const fixes = [
    // Line 192: error message
    ["\u896b\u7ef4\u9a0d\u5561\u532f\u6397\u8f38\u84e3\uff0c\u84e3\u84e3", "\u8ba2\u5355\u63d0\u4ea4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5"],
];

fixes.forEach(([from, to]) => {
    if (c.includes(from)) {
        c = c.split(from).join(to);
        console.log('Fixed: ' + from.substring(0, 20));
    }
});

fs.writeFileSync(path, c, 'utf-8');
console.log('Done');
