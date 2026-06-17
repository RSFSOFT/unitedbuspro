const fs = require('fs');
try {
    const code = fs.readFileSync('public/js/main.js', 'utf8');
    new Function(code);
    console.log("Syntax is OK!");
} catch (err) {
    console.error("Syntax Error found:", err);
}
