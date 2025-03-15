import matches from "../model/matches.model.js";
import teamSchema from "../model/team.model.js";
import { makeTeam } from "./team.controller.js";

const createMatch = async (req, res)=> {
    try {
        const matchInfo = req.body;
        if(!matchInfo)
            return res.status(400).json({error: "match info missing"})
        await matches.create(matchInfo);
        
    } catch (error) {
        res.status(500).json({eror: error.message})
    }
}

export {
    createMatch
}