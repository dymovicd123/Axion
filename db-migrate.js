const path = require('node:path');
const { createDatabase } = require('./database');
const { createAuth } = require('./auth');
(async () => {
    const file = process.env.AXION_DATA_FILE || path.join(__dirname, 'data', 'db.sqlite');
    createAuth(file);
    const db = createDatabase(file);
    const data = await db.read();
    console.log(`SQLite database: ${db.filename}`);
    console.table(Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.length])));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
