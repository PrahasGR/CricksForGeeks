import express from "express";
import {
    addPlayers,
    getPlayer,
    getAllPlayers
} from "../controller/player.controller.js"
import { authenticate } from "../middleware/auth.middleware.js";

const playerRouter = express.Router()

playerRouter.post('/addPlayer',authenticate, addPlayers);
playerRouter.get('/getall/players',authenticate, getAllPlayers);
playerRouter.get('/get/player',authenticate, getPlayer);

export default playerRouter