import { Request, Response } from "express";
import { pool } from "../database/db";

interface AuthRequest <T> extends Request {
    user?: {id: number, name: T, last_name: T, email: T, date: T}
};

export async function getCurrentUser (req: AuthRequest<string>, res: Response) {
    try {

        const user = req.user;

        const query = `SELECT * FROM users WHERE id = $1`;

        const response = await pool.query(query, [user?.id, ]);

        const data = response.rows[0]

        res.status(200).json({
            "name": data?.name,
            "last_name": data?.last_name,
            "email": data?.email,
            "date": data?.date,
        })

    } catch (error: any) {
        res.status(400).json({
            "message": "error in getCurrentUser",
            "error": error.mesage
        })
    }
}