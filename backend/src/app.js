import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import {createServer} from "node:http";

import cors from "cors";
import { connectDB } from './database/db.js';
import userRoutes from "./routes/users.routes.js";
import { connectToSocket } from './controllers/socketManager.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


const PORT = process.env.PORT || 8000;
app.use(cors());

app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({extended: true, limit: "40kb"}));

app.use("/api/v1/user", userRoutes);

server.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})