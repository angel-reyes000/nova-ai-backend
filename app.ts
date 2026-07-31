import express from 'express';
import cors from 'cors';
import { testConectionDB } from './database/db';
import { getUsers, postUser, loginUser, auth } from './controllers/users';
import { deleteConversations, getConversations, postConversation } from './controllers/conversations';
import { getMessages, postMessages } from './controllers/messages';
import { getCurrentUser } from './controllers/currentUser';
import { googleAuth } from './controllers/googleAuth';

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/users", getUsers);
app.post("/api/users", postUser);

app.get("/api/loginUser", () => null);
app.post("/api/loginUser", loginUser);

app.get('/api/conversations', auth, getConversations);
app.post('/api/conversations', auth, postConversation);
app.delete('/api/conversations', auth, deleteConversations);

app.get('/api/messages/:conversationID', auth, getMessages);
app.post('/api/messages', auth, postMessages);

app.get('/api/currentUser', auth, getCurrentUser);

app.post('/api/auth/google', auth, googleAuth);


app.listen("5001", () => {
    try {
        console.log("Listening server...")
        testConectionDB()
    } catch (error: any) {
        console.log("Error: ", error.message)
    }
})