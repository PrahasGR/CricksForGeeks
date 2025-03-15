import matches from "../model/matches.model.js";
import matchStats from "../model/matchstats.model.js";
import teamSchema from "../model/team.model.js";
import { makeTeam } from "./team.controller.js";

const createMatch = async (req, res)=> {
    try {
        const matchInfo = req.body;
        if(!matchInfo)
            return res.status(400).json({error: "match info missing"})
        
        const team1 = matchInfo.team1
        const team2 = matchInfo.team2
        const team1arr = await teamSchema.findOne({
            where: { id: team1 },
            attributes: ['playerID'] 
        });
        const team2arr = await teamSchema.findOne({
            where: { id: team2 },
            attributes: ['playerID'] 
        });
        if (!team1arr || !team2arr)
            return res.status(404).json({ error: "One or both teams not found" });
    
        const team1Players = team1arr.dataValues.playerID;
        const team2Players = team2arr.dataValues.playerID;

        const hasCommonPlayers = team1Players.some(player => team2Players.includes(player));

        if (hasCommonPlayers)
            return res.status(400).json({ error: "Both teams have some same players" });
        
        console.log(team1arr.dataValues, team2arr.dataValues);
        const match=await matches.create(matchInfo);

        team1Players.forEach(element => {
            const playerId=element;
            const matchId=match.id
            matchStats.create({playerId,matchId})
        });
        team2Players.forEach(element => {
            const playerId=element;
            const matchId=match.id
            matchStats.create({playerId,matchId})
        });
        res.status(200).json({message: "match created"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getAllMatches = async (req, res)=>{
    try {
        const match = await matches.findAll()
        if(!match)
            return res.status(200).json({message: "no matches found"})
        res.status(200).json({
            message: "some matches found",
            matches: match
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    createMatch,
    getAllMatches
}