import matches from "../model/matches.model.js";
import teamSchema from "../model/team.model.js";
import { makeTeam } from "./team.controller.js";

const createMatch = async (req, res)=> {
    try {
        const matchInfo = req.body;
        if(!matchInfo)
            return res.status(400).json({error: "match info missing"})
        const match = await matches.create(matchInfo);
        const team1 = matchInfo.team1
        const team2 = matchInfo.team2
        const team1arr = await teamSchema.findOne({
            where: { id: team1 },
            attributes: ['playerID'] // Fetch only the playerID column
        });
        const team2arr = await teamSchema.findOne({
            where: { id: team2 },
            attributes: ['playerID'] // Fetch only the playerID column
        });
        if (!team1arr || !team2arr) {
            return res.status(404).json({ error: "One or both teams not found" });
        }
        const team1Players = team1arr.dataValues.playerID;
        const team2Players = team2arr.dataValues.playerID;

        // Check if any player exists in both teams
        const hasCommonPlayers = team1Players.some(player => team2Players.includes(player));

        if (hasCommonPlayers) {
            return res.status(400).json({ error: "Both teams have some same players" });
        }
        console.log(team1arr.dataValues, team2arr.dataValues);

        res.status(200).json({message: "match created"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    createMatch
}