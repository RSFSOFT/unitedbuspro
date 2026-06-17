const serverless = require('serverless-http');
const app = require('../../server'); // Imports Express app exported from server.js

// Netlify serverless function entrypoint wrapping Express app
exports.handler = serverless(app);
