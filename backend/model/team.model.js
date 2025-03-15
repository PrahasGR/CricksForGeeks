import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const teamSchema = sequelize.define("Team", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    playerID: {
        type: DataTypes.ARRAY(DataTypes.UUID), 
        references: { model: 'players', key: 'id' }
    },
    teamName: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    tableName: "team"
})

export default teamSchema;