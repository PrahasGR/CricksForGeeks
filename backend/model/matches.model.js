import sequelize from "../config/database";
import { DataTypes } from "sequelize";
const matches = sequelize.define('Matches',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    Tournament:{
        type:DataTypes.STRING,
    },
    matchDate:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    venue:{
        type:DataTypes.STRING,
        defaultValue:0
    },
    typeOfMatch:{
        type:DataTypes.STRING,
    },
    format:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    team1:{
        type:DataTypes.STRING,
        defaultValue:0
    },
    team2:{
        type:DataTypes.STRING,
        defaultValue:0
    },
    firstBatting: {
        type: DataTypes.STRING,
    },
    firstInningsScore: {
        type: DataTypes.INTEGER
    },
    firstInningsWickets: {
        type: DataTypes.INTEGER
    },
    firstInningsBalls: {
        type: DataTypes.INTEGER
    },
    secondInningsScore: {
        type: DataTypes.INTEGER
    },
    secondInningsWickets: {
        type: DataTypes.INTEGER
    },
    secondInningsBalls: {
        type: DataTypes.INTEGER
    },
    result:{
        type:DataTypes.STRING,
        defaultValue:0
    }
    
},{
    timestamps: true,
    tableName: "matches"
})

export default matches;