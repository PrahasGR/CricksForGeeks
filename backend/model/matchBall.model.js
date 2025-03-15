import sequelize from "../config/database.js";
import { DataTypes, INTEGER } from "sequelize";

const matchBallsSchema = sequelize.define('MatchBalls', {
    ballID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    ballNo: {
        type: DataTypes.INTEGER,
        
    },
    batsman: {
        type: DataTypes.UUID,
        references: {
            model: 'player',  
            key: 'id'         
        }

    },
    match:{
        type: DataTypes.UUID,
        references: {
            model: 'matches',  
            key: 'id'         
        }
    },
    bowler:{
        type: DataTypes.UUID,
        references: {
            model: 'player',  
            key: 'id'         
        }
    },
    runs:{
        type:INTEGER
    },
    wicket:{
        type:Boolean
    },
    batsmanOut:{
        type: DataTypes.UUID,
        references: {
            model: 'player',  
            key: 'id'         
        }
    },
    byes:{
        type:INTEGER
    },
    lb:{
        type:INTEGER
    },
    wide:{
        type:Boolean

    },
    noBall:{
        type:Boolean
    }
},
{
    timestamps:true,
    tableName:'ball'
});
export default matchBallsSchema;