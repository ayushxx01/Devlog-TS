"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const initDb = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        repo TEXT NOT NULL,
        commit_hash TEXT NOT NULL,
        message TEXT NOT NULL,
        commit_time TIMESTAMP NOT NULL
            )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS summaries (
            id SERIAL PRIMARY KEY,
            repo TEXT NOT NULL,
            summary TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
            )`);
        console.log("✅ Database initialized");
    }
    catch (error) {
        console.error("Error initializing database:", error);
    }
};
initDb();
exports.default = pool;
//# sourceMappingURL=db.js.map