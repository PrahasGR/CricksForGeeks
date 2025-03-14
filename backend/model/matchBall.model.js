import sequelize from "../config/database";
import { DataTypes } from "sequelize";

const matchBallsSchema = sequelize.define('MatchBalls', {
    matchID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
})