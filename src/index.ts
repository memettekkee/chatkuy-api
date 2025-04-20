import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { initializeSocket } from './websocket/socket';

import userRoute from './routes/userRoutes'
import chatRoute from './routes/chatRoutes'
import groupChatRoute from './routes/groupChatRoutes'

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ credentials: true }));

app.use('/', userRoute)
app.use('/', chatRoute)
app.use('/', groupChatRoute)

const server = http.createServer(app);

const io = initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
