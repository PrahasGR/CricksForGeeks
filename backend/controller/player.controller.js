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

const getPlayer = async (req, res)=>{
    try {
        const {id} = req.params
        const attr = await playerSchema.findOne({where: {id}})
        if(!attr)
            return res.status(400).json({error: "Not found"})
        res.status(200).json({attr})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getAllPlayers = async (req, res)=>{
    try {
        const attr = await playerSchema.findAll()
        if(!attr)
            return res.status(200).json({message: "No players found"})
        res.status(200).json({attr})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    addPlayers,
    getPlayer,
    getAllPlayers
}