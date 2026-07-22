import { Request, Response } from "express";

export default function getMessages (req: Request, res: Response) {
    try {

    } catch (error: any) {
        res.status(400).json({
            "message": "Not found messages",
            "error": error.message
        })
    }
}