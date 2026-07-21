import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

export async function testConectionDB () {
    try {
        await pool.connect()
        console.log("Connected to data base")
    } catch (error: any) {
        console.log("Error: ", error.message)
    }
}