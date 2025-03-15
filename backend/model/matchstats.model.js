import sequelize from "../config/database.js";
import { DataTypes, INTEGER } from "sequelize";
const matchStats=sequelize.define('matchStats',{
    matchId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    
    },
    playerId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    roleInMatch: {
        type: DataTypes.STRING
    },
    runs: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ballsFaced: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    battingStrikeRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sixes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    fours: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    inAt: {
        type: DataTypes.INTEGER,
    },
    notOut: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    outType: {
        type: DataTypes.STRING
    },
    bowledOutBy: {
        type: DataTypes.UUID
    },
    caughtBy: {
        type: DataTypes.UUID
    },
    runOutBy: {
        type: DataTypes.UUID
    },
    ballsBowled: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    runsGiven: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    wicketsTaken: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    widesBowled: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    noBalls: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    maidenOvers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stumpingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    cathcesCaught: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
},{
    timestamps: true,
    tableName: 'matchstats'
})

export default matchStats;