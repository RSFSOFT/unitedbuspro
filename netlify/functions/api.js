const serverless = require('serverless-http');
const app = require('../../server');

const handler = serverless(app);

exports.handler = async (event, context) => {
    try {
        return await handler(event, context);
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: `Serverless Function Execution Error:\n${err.stack}`
        };
    }
};
