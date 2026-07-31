import { Request, Response } from "express";
import { chatGemini } from "./gemini";
import { pool } from "../database/db";

interface AuthRequest extends Request {
    user?: {id: number, name: string}
};

export async function getConversations (req: AuthRequest, res: Response) {
    try {

        const user = req.user;

        const consulta = "SELECT * FROM conversations WHERE user_id = $1";

        const data = await pool.query(consulta, [user?.id, ]);

        return res.status(200).json([
            data.rows,
            user?.name
        ])

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

        const values = ['Whitout conversation', user_id];

        const data = await pool.query(consulta, values);

        return res.status(200).json(
            data.rows[0]
        );

    } catch (error: any) {
        res.status(404).json({
            "message": "Not found conversation",
            "error": error.message
        })
    }
}

export async function deleteConversations (req: AuthRequest, res: Response) {
    try {

        const user = req.user;

        const query = `DELETE FROM conversations WHERE user_id = $1 RETURNING *`;

        const response = await pool.query(query, [user?.id, ]);

        const data = await response.rows;

        return res.status(200).json(
            data
        );

    } catch (error: any) {
        return res.status(400).json({
            "message": "error in deleteConversation",
            "error": error.message
        })
    }
}