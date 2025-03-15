import teamSchema from "../model/team.model.js"


const makeTeam = async (req, res) => {
    try {
        await teamSchema.create(req.body);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {
    makeTeam
}