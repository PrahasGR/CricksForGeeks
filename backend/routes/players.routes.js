import express from "express";
import {
    addPlayers
} from "../controller/player.controller.js"

const playerRouter = express.Router()

playerRouter.post('/addPlayer', addPlayers);

export default playerRouter