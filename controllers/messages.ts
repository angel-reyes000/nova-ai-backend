import { Request, Response } from "express";
import { pool } from "../database/db";
import { chatGemini } from "./gemini";
import { postConversation } from "./conversations";

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

export async function postMessages (req: Request, res: Response) {
    try {
        const { content, conversation_id, title } = req.body;

        const consulta = `INSERT INTO messages (role, content, conversation_id)
                          VALUES ($1, $2, $3) RETURNING *`;

        const values = ["user", content, conversation_id];

        const data = await pool.query(consulta, values);

        const message = await data.rows[0]
        console.log(message)

        const geminiResponse = await chatGemini(message.content);
        if (geminiResponse === "no tokens") {
            return res.status(400).json({
                "error": "You exceeded your current quota of tokens, try again later."
            })
        } else if (geminiResponse === "connection error") {
            return res.status(400).json({
                "error": "Connection error"
            })
        }

        const consultaGemini = `INSERT INTO messages (role, content, conversation_id)
                                VALUES ($1, $2, $3) RETURNING *`;

        const valuesGemini = ['ai', geminiResponse, conversation_id];
        
        const dataGemini = await pool.query(consultaGemini, valuesGemini);
        console.log(dataGemini.rows[0])

        let dataTitle = '';

        if (title === 'Whitout conversation' || title === '') {
            console.log("ENTRANDO A SIN TITULOOOOO")
            try {
                const queryFirstMessage = `SELECT content FROM messages WHERE conversation_id = $1 ORDER BY id ASC LIMIT 1`;
                const contentFirstMessage = await pool.query(queryFirstMessage, [conversation_id]);
                console.log("pidiendo titulo...")
                console.log('OOOOOOOOOOOOOOOo', contentFirstMessage.rows[0].content, 'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO')
                dataTitle = await contentFirstMessage.rows[0].content;
                const geminiTitle = await chatGemini(`
                    **Solamente haz lo que se te pide y no pongas nada mas** 
                    Crea un titulo de maximo 25 caracteres contando espacios y 
                    cualquier caracter existente en basea este mensaje:
                    ${contentFirstMessage.rows[0].content}
                `)
                console.log("tiitulo pedido")
                console.log('Gemini title: ', geminiTitle)
                
                const queryNewTitle = `UPDATE conversations SET title = $1 WHERE id = $2 RETURNING *`;
                
                const valuesNewTitle = [geminiTitle, conversation_id];
                console.log("VALUESNEWTITLE: ", geminiTitle, conversation_id)

                const dataNewTitle = await pool.query(queryNewTitle, valuesNewTitle);
                console.log("NUEVO  TITITIITITITITIT", dataNewTitle.rows[0], "NUEVO  TITITIITITITITIT");

            } catch (error: any) {
                return res.status(400).json({
                    "ERROR": "ERROR OF TITLE",
                    "message": error.message
                })
            }
        } else {
            dataTitle = title
        }

        return res.status(200).json([
            data.rows[0],
            dataGemini.rows[0],
            dataTitle,
        ])

    } catch (error: any) {
        return res.status(400).json({
            "message": "error in postMessages",
            "error": error.message
        })
    }
}