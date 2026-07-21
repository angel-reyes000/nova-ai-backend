import express from 'express';
import cors from 'cors';
import { testConectionDB } from './database/db';
import { getUsers, postUser, loginUser, auth } from './controllers/users';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/users", auth, getUsers);
app.post("/api/users", auth, postUser);

app.get("/api/loginUser", () => null);
app.post("/api/loginUser", loginUser);


app.listen("5001", () => {
    try {
        console.log("Listening server...")
        testConectionDB()
    } catch (error: any) {
        console.log("Error: ", error.message)
    }
})