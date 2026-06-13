import {Pool} from 'pg';


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDb = async (): Promise<void> => {
    try {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        repo TEXT NOT NULL,
        commit_hash TEXT NOT NULL,
        message TEXT NOT NULL,
        commit_time TIMESTAMP NOT NULL
            )`
        );

        await pool.query(
            `CREATE TABLE IF NOT EXISTS summaries (
            id SERIAL PRIMARY KEY,
            repo TEXT NOT NULL,
            summary TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
            )`
        )
    
        console.log("✅ Database initialized");
    } catch (error) {
        console.error("Error initializing database:", error);
    }

}

initDb();


export default pool;