import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const playerSchema = sequelize.define('Player', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    playerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    nationality:{
        type:DataTypes.STRING,
        allowNull:false
    },
    playerImage:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    numberOfMatches:{
        type:DataTypes.INTEGER,

    },
    specialization:{
        type:DataTypes.STRING,
        allowNull:false
    },
    totalRuns:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    highestScore:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    avg:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    strikeRate:{
        type:DataTypes.FLOAT,
        defaultValue:0

    },
    Century:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    halfCentury:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    boundry:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    sixes:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    ballsFaced:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    catchestaken:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    Stumpings:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    balls:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    runsGiven:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    wickets:{
        type:DataTypes.INTEGER,
        defaultValue:0

    },
    bbm:{
        type:DataTypes.STRING,
        defaultValue:0

    }
    ,
    avg:{
        type:DataTypes.FLOAT,
        defaultValue:0

    }
    ,
    eco:{
        type:DataTypes.FLOAT,
        defaultValue:0

    },
    bowlstrikerate:{
        type:DataTypes.FLOAT,
        defaultValue:0

    }
},
{
    timestamps:true,
    tableName:'player'
}
);
export default playerSchema;