import express from "express"
import {
    createMatch,
    getAllMatches
} from "../controller/match.controller.js"

const router = express.Router()

router.post('/create/match', createMatch)
router.get('/getallmatches', getAllMatches)

export default router;