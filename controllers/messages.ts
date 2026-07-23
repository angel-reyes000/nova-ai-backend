import { Request, Response } from "express";
import { pool } from "../database/db";

export async function getMessages (req: Request, res: Response) {
    try {

        const conversation_id = req.params.conversationID;

        const consulta = `SELECT * FROM messages WHERE conversation_id = ${conversation_id}`;

        const data = await pool.query(consulta);

        return res.status(200).json(
            data.rows
        )

    } catch (error: any) {
        res.status(400).json({
            "message": "Not found messages",
            "error": error.message
        })
    }
}