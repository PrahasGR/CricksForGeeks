import express from "express"
import {
    createMatch
} from "../controller/match.controller.js"

const router = express.Router()

router.post('/create/match', createMatch)

export default router;