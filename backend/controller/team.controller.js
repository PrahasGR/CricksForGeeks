import teamSchema from "../model/team.model.js"


const makeTeam = async (req, res) => {
    try {
        await teamSchema.create(req.body);
        res.status(200).json({message: "made team"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    makeTeam
}