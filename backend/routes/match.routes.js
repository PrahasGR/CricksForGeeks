import express from "express"
import {
    createMatch,
    getAllMatches,
    getMatch
} from "../controller/match.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post('/create/match',authenticate, createMatch)
router.get('/getall/matches',authenticate, getAllMatches)
router.get('/get/match',authenticate, getMatch)

export default router;