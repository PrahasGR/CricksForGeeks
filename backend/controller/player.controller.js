import playerSchema from "../model/player.model.js";

const addPlayers = async (req, res) => {
    try {
        const playerInfo = req.body;
        if(!playerInfo)
            return res.status(400).json({error: "player info invalid"})
        await playerSchema.create(playerInfo)
        res.status(200).json({message: "palyer added successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    addPlayers
}