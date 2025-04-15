import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
sequelize.sync({alter:true});
const matchBallsSchema = sequelize.define('MatchBalls', {
  ballID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ballNo: {
    type: DataTypes.FLOAT
  },
  batsman: {
    type: DataTypes.UUID,
    references: {
      model: 'player',
      key: 'id'
    }
  },
  match: {
    type: DataTypes.UUID,
    references: {
      model: 'matches',
      key: 'id'
    }
  },
  bowler: {
    type: DataTypes.UUID,
    references: {
      model: 'player',
      key: 'id'
    }
  },
  runs: {
    type: DataTypes.INTEGER
  },
  wicket: {
    type: DataTypes.BOOLEAN
  },
  batsmanOut: {
    type: DataTypes.UUID,
    references: {
      model: 'player',
      key: 'id'
    }
  },
  byes: {
    type: DataTypes.INTEGER
  },
  lb: {
    type: DataTypes.INTEGER
  },
  wide: {
    type: DataTypes.BOOLEAN
  },
  noBall: {
    type: DataTypes.BOOLEAN
  },
  // New columns to explicitly record fours and sixes
  is_four: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_six: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'ball'
});

export default matchBallsSchema;
