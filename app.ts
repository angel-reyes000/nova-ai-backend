import express from 'express';
import cors from 'cors';
import { testConectionDB } from './database/db';
import { getUsers, postUser, loginUser, auth } from './controllers/users';
import { getConversations, postConversation } from './controllers/conversations';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/users", getUsers);
app.post("/api/users", postUser);

app.get("/api/loginUser", () => null);
app.post("/api/loginUser", loginUser);

app.get('/api/conversations', auth, getConversations);
app.post('/api/conversations', auth, postConversation);


app.listen("5001", () => {
    try {
        console.log("Listening server...")
        testConectionDB()
    } catch (error: any) {
        console.log("Error: ", error.message)
    }
})