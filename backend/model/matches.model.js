import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
// sequelize.sync({alter:true});
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
    team1: { type: DataTypes.UUID, references: { model: 'team', key: 'id' } },
    team2: { type: DataTypes.UUID, references: { model: 'team', key: 'id' } },
    firstBatting: {
        type: DataTypes.UUID,
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