const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log("Querying home page on Netlify Dev (http://localhost:8888/)...");
        const home = await get('http://localhost:8888/');
        console.log("Home Page Status:", home.statusCode);
        console.log("Home Page Body Length:", home.body.length);
        if (home.body.includes('United Bus Pro')) {
            console.log("Home Page content check: PASS!");
        } else {
            console.log("Home Page content check: FAIL!");
            console.log("Preview:", home.body.substring(0, 500));
        }

        console.log("\nQuerying Customer Portal login page (http://localhost:8888/customer/login)...");
        const login = await get('http://localhost:8888/customer/login');
        console.log("Login Page Status:", login.statusCode);
        if (login.body.includes('Client Portal')) {
            console.log("Login Page content check: PASS!");
        } else {
            console.log("Login Page content check: FAIL!");
            console.log("Preview:", login.body.substring(0, 500));
        }

        console.log("\nQuerying static asset (http://localhost:8888/css/style.css)...");
        const asset = await get('http://localhost:8888/css/style.css');
        console.log("Static CSS Status:", asset.statusCode);
        if (asset.body.includes('Pricing Section')) {
            console.log("Static CSS content check: PASS!");
        } else {
            console.log("Static CSS content check: FAIL!");
        }

    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

run();
