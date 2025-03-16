import teamSchema from "../model/team.model.js"


const makeTeam = async (req, res) => {
    try {
        await teamSchema.create(req.body);
        res.status(200).json({message: "made team"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getTeam = async (req, res)=>{
    try {
        const {id} = req.params
        const attr = await teamSchema.findOne({where: {id}})
        if(!attr)
            return res.status(400).json({error: "Not found"})
        res.status(200).json({attr})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const getAllTeams = async (req, res)=>{
    try {
        const attr = await teamSchema.findAll()
        if(!attr)
            return res.status(200).json({message: "No teams found"})
        res.status(200).json({attr})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const updateTeam = async (req, res) => {
    try {
      const { id } = req.params;
      const teamData = req.body;
      
      const team = await teamSchema.findOne({ where: { id } });
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      await team.update(teamData);
      
      res.status(200).json({ message: "Team updated successfully", attr: team });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export {
    makeTeam,
    getAllTeams,
    getTeam,
    updateTeam
}