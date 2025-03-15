import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
const PlayerMatchStats = sequelize.define('PlayerMatchStats', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    matchId: { type: DataTypes.UUID, references: { model: 'matches', key: 'id' } },
    playerId: { type: DataTypes.UUID, references: { model: 'players', key: 'id' } },
    runsScored: { type: DataTypes.INTEGER, defaultValue: 0 },
    ballsFaced: { type: DataTypes.INTEGER, defaultValue: 0 },
    wicketsTaken: { type: DataTypes.INTEGER, defaultValue: 0 },
    runsGiven: { type: DataTypes.INTEGER, defaultValue: 0 },
    oversBowled: { type: DataTypes.INTEGER, defaultValue: 0 },
    catches: { type: DataTypes.INTEGER, defaultValue: 0 },
    stumpings: { type: DataTypes.INTEGER, defaultValue: 0 },
    boundaries: { type: DataTypes.INTEGER },
    sixes: { type: DataTypes.INTEGER },
    strikeRate: { type: DataTypes.FLOAT }
  },
{
    timestamps:true,
    tableName:"playerMatchStats"
});
  

export default PlayerMatchStats;