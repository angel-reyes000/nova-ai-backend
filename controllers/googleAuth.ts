import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { pool } from '../database/db';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import crypto from "crypto";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT)

export async function googleAuth (req: Request, res: Response) {
    try {
        const { token: googleToken } = req.body;

        if (!googleToken) {
            return res.status(400).json({ "Error": "Token no recibido" });
        }

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT
        });

        const payload: any = ticket.getPayload();

        const checkUser = await pool.query(
            "SELECT * FROM users WHERE email = $1", 
            [payload.email]
        );

        let userId;

        if (checkUser.rows.length > 0) {
            userId = checkUser.rows[0].id;
        } else {
            const consulta = `
                INSERT INTO users (name, last_name, email, password)
                VALUES ($1, $2, $3, $4) RETURNING *;
            `;

            const createPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(createPassword, 10);

            const resultado = await pool.query(consulta, [
                payload.given_name || payload.name,
                payload.family_name || 'Google',
                payload.email,
                hashedPassword
            ]);
            userId = resultado.rows[0].id;
        }

        const jwtToken = jwt.sign(
            { id: userId },
            process.env.SECRET!,
            { expiresIn: "7d" }
        );

        res.status(200).json({ token: jwtToken });

    } catch (error: any) {
        console.error("Error en postGoogle:", error.message);
        res.status(400).json({ "Error": error.message });
    }
};