const http = require('http');

http.get('http://localhost:8888/admin/login', (res) => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('BODY LENGTH:', data.length);
        console.log('BODY PREVIEW:', data.slice(0, 1000));
    });
}).on('error', (err) => {
    console.error('ERROR:', err);
});
