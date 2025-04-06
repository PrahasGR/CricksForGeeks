import matches from "../model/matches.model.js";
import matchStats from "../model/matchstats.model.js";
import teamSchema from "../model/team.model.js";
import playerSchema from "../model/player.model.js";

const createMatch = async (req, res) => {
    try {
        const matchInfo = req.body;
        if (!matchInfo)
            return res.status(400).json({ error: "match info missing" });

        const team1 = matchInfo.team1;
        const team2 = matchInfo.team2;

        // Retrieve team details including their player arrays
        const team1Data = await teamSchema.findOne({
            where: { id: team1 },
            attributes: ['playerID']
        });
        const team2Data = await teamSchema.findOne({
            where: { id: team2 },
            attributes: ['playerID']
        });

        if (!team1Data || !team2Data)
            return res.status(404).json({ error: "One or both teams not found" });

        const team1Players = team1Data.dataValues.playerID;
        const team2Players = team2Data.dataValues.playerID;

        // Check for common players in both teams
        const hasCommonPlayers = team1Players.some(player => team2Players.includes(player));
        if (hasCommonPlayers)
            return res.status(400).json({ error: "Both teams have some same players" });

        // Create the match record
        const match = await matches.create(matchInfo);

        // Create matchStats records for team1 players
        const team1Promises = team1Players.map(async (playerId) => {
            // Retrieve player's specialization from the player schema
            const player = await playerSchema.findOne({
                where: { id: playerId },
                attributes: ['specialization']
            });
            console.log(team1);
            
            return matchStats.create({
                playerId,
                teamId: team1,
                matchId: match.id,
                roleInMatch: player ? player.specialization : 'unknown'
            });
        });

        // Create matchStats records for team2 players
        const team2Promises = team2Players.map(async (playerId) => {
            const player = await playerSchema.findOne({
                where: { id: playerId },
                attributes: ['specialization']
            });
            return matchStats.create({
                playerId,
                teamId: team2,
                matchId: match.id,
                roleInMatch: player ? player.specialization : 'unknown'
            });
        });

        // Wait until all matchStats records are created
        await Promise.all([...team1Promises, ...team2Promises]);

        return res.status(200).json({ message: "Match created successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


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

const getMatch = async (req, res)=>{
    try {
        const {id} = req.body
        const attr = await matches.findOne({where: {id}})
        if(!attr)
            return res.status(200).json({message: "No match found"})
        res.status(200).json(attr)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getMatchStats = async (req, res)=>{
    try {
        const matchId = req.params.id
        const attr = await matchStats.findAll({
            where: {matchId}
        })
        res.status(200).json({attr})

    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    createMatch,
    getAllMatches,
    getMatch,
    getMatchStats
}