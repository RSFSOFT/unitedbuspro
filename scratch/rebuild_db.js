const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');
console.log("Locating db.json at:", dbPath);

if (fs.existsSync(dbPath)) {
    console.log("Found existing db.json. Deleting...");
    fs.unlinkSync(dbPath);
}

console.log("Loading database.js to trigger fresh initialization...");
const dbModule = require('../database');

// Trigger readDb() by reading settings
const settings = dbModule.getSettings();
console.log("Database successfully re-seeded!");
console.log("Phone number set to:", settings.phone);
console.log("Address set to:", settings.address);
console.log("Fleet count seeded:", dbModule.getFleet().length);
console.log("Services count seeded:", dbModule.getServices().length);
