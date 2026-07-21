import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config()

interface AuthRequest extends Request {
    user?: string | object;
}

export async function getUsers(req: Request, res: Response) {
    try {
        const consulta: string = "SELECT * FROM users";

        const data =  await pool.query(consulta)

        return res.status(200).json(
            data.rows
        );

    } catch (error: any) {
        return res.json({
            message: "Error to get users",
            Error: error.message
        });
    }
}

export async function postUser (req: Request, res: Response) {
    try {
        const { name, last_name, email, password }:{ name:string, last_name:string, email:string, password:string} = req.body;

        const consulta: string = `INSERT INTO users (name, last_name, email, password) 
                                  VALUES ($1, $2, $3, $4) RETURNING *`

        const password_hashed = await bcrypt.hash(password, 10);

        const list_data = [name, last_name, email, password_hashed]

        const post = await pool.query(consulta, list_data);

        console.log(post.rows[0])
        return res.status(201).json({
            "message": `User ${post.rows[0].name} created`
        })

    } catch (error: any) {
        return res.json({
            message: "Error to post user",
            Error: error.message
        });
    }
}

export async function loginUser (req: Request, res: Response) {
    try {
        const { email, password }:{ email:string, password:string } = req.body;
            
        const consulta: string = `SELECT * FROM users WHERE email = $1`;

        const data = await pool.query(consulta, [email,]);

        const user = await data.rows[0];

        if (!user) {
            return res.status(400).json({
                "Error": "User not exist"
            })
        }

        const verifyUser = await bcrypt.compare(password, user.password);

        if (!verifyUser) {
            return res.status(400).json({
                "Error": "Invalid password"
            })
        }

        const token = jwt.sign(
            {
                id: user.id, 
                name: user.name
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "1h"
            },
        )

        return res.json({
            "Message": "Correct login",
            userID: user.id,
            token: token
        });

    } catch (error: any) {
        return res.json({
            "message": "error in login",
            "Error": error.message,
        })
    }

}

export async function auth (req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token: any = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.json({
                "message":"Invalid Token"
            });
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = decoded;

        next();

    } catch (error: any) {
        return res.status(400).json({
            "Error": error.message,
            "message": "Error of authentication"
        })
    }
}