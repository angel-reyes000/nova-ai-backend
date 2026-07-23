import { Request, Response } from "express";
import { chatGemini } from "./gemini";
import { pool } from "../database/db";

interface AuthRequest extends Request {
    user?: {id: number, name: string}
};

export async function getConversations (req: Request, res: Response) {
    try {

        const consulta = "SELECT * FROM conversations";

        const data = await pool.query(consulta);

        return res.status(200).json(
            data.rows
        )

    } catch (error: any) {
        res.status(404).json({
            "message": "Not found conversation",
            "error": error.message
        })
    }

}

export async function postConversation (req: AuthRequest, res: Response) {
    try {
        const consulta = `INSERT INTO conversations (title, user_id) VALUES ($1, $2) RETURNING *`;

        const user_id = req.user?.id;

        if (!user_id) {
            return res.status(404).json({
                "message": "User don't have permission of create new chat."
            })
        }

        const values = [' ', user_id];

        const data = await pool.query(consulta, values);

        return res.status(201).json(
            data.rows
        );

    } catch (error: any) {
        res.status(404).json({
            "message": "Not found conversation",
            "error": error.message
        })
    }
}