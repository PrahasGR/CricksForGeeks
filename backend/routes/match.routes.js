import express from "express"
import {
    createMatch,
    getAllMatches,
    getMatch,
    getMatchStats
} from "../controller/match.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post('/create/match',authenticate, createMatch)
router.get('/getall/matches',authenticate, getAllMatches)
router.post('/get/match',authenticate, getMatch)
router.get('/get/match/stats/:id', authenticate, getMatchStats)

export default router;