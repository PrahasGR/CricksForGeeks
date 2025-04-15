# CricksForGeeks

A comprehensive cricket statistics and match management platform built for tracking teams, players, matches, and ball-by-ball cricket data.

## Project Overview

CricksForGeeks is a full-stack cricket management application that provides detailed tracking and analysis for cricket matches. The platform enables users to create and manage teams, maintain player profiles with comprehensive statistics, organize matches, and record detailed ball-by-ball data during live games.

This project was developed as a DBMS course project, focusing on creating a robust database schema to handle complex relationships between cricket entities while maintaining data integrity.

## Features

- **User Authentication**: Secure login/registration system
- **Team Management**: Create, view, and edit cricket teams
- **Player Profiles**: Comprehensive player statistics including batting and bowling metrics
- **Match Creation and Management**: Set up matches between teams with detailed match information
- **Live Ball-by-Ball Recording**: Detailed ball recording with support for:
  - Runs, boundaries (fours and sixes)
  - Extras (wides, no-balls, byes, leg-byes)
  - Wickets and dismissal information
- **Innings Management**: Support for tracking both innings in a match
- **Statistics Dashboard**: Real-time updating statistics for players and teams
- **Responsive UI**: Works on both desktop and mobile devices

## Technology Stack

### Frontend
- **Next.js**: React framework with server-side rendering
- **Tailwind CSS**: For styling and responsive design
- **shadcn/ui**: Component library for consistent UI elements
- **React Hooks**: For state management

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **Sequelize ORM**: For database operations
- **JWT Authentication**: For secure user authentication

### Database
- **PostgreSQL**: Relational database for storing structured data
- **UUID**: For generating unique identifiers

## Database Design

Our database schema is designed to model the complex relationships in cricket while maintaining efficient queries and data integrity.

### Entity Relationship Diagram

```
User
 │
 ├─(creates)─┐
 │           ▼
 │        Matches ◄────────┐
 │           │             │
 │           │             │
 │  ┌────────▼─────────┐   │
 │  │                  │   │
 │  ▼                  ▼   │
Team ◄───────────► MatchStats
 │                    │
 │                    │
 ▼                    ▼
Player ◄────────► MatchBalls
```

### Database Tables

#### Users
Stores authentication information for system users.
```javascript
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
});
```

#### Teams
Contains team information and references to players.
```javascript
const teamSchema = sequelize.define("Team", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    playerID: { type: DataTypes.ARRAY(DataTypes.UUID) },
    teamName: { type: DataTypes.STRING }
}, {
    timestamps: true,
    tableName: "team"
});
```

#### Players
Stores player information and career statistics.
```javascript
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
    nationality: { type: DataTypes.STRING, allowNull: false },
    specialization: { type: DataTypes.STRING, allowNull: false },
    totalRuns: { type: DataTypes.INTEGER, defaultValue: 0 },
    wickets: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Additional statistics fields...
});
```

#### Matches
Contains match details between two teams.
```javascript
const matches = sequelize.define('Matches', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    team1: { type: DataTypes.UUID, references: { model: 'team', key: 'id' } },
    team2: { type: DataTypes.UUID, references: { model: 'team', key: 'id' } },
    venue: { type: DataTypes.STRING },
    matchDate: { type: DataTypes.DATEONLY, allowNull: false },
    format: { type: DataTypes.INTEGER, defaultValue: 0 },
    firstBatting: { type: DataTypes.UUID },
    // Innings statistics
    firstInningsScore: { type: DataTypes.INTEGER },
    firstInningsWickets: { type: DataTypes.INTEGER },
    // Additional match data...
});
```

#### MatchStats
Links players to matches with their performance metrics.
```javascript
const matchStats = sequelize.define('matchStats', {
    matchId: { type: DataTypes.UUID },
    teamId: { type: DataTypes.UUID },
    playerId: { type: DataTypes.UUID },
    roleInMatch: { type: DataTypes.STRING },
    runs: { type: DataTypes.INTEGER, defaultValue: 0 },
    ballsFaced: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Additional match performance data...
});
```

#### MatchBalls
Stores detailed ball-by-ball information for matches.
```javascript
const matchBallsSchema = sequelize.define('MatchBalls', {
    ballID: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ballNo: { type: DataTypes.FLOAT },
    batsman: { type: DataTypes.UUID, references: { model: 'player', key: 'id' } },
    bowler: { type: DataTypes.UUID, references: { model: 'player', key: 'id' } },
    runs: { type: DataTypes.INTEGER },
    wicket: { type: DataTypes.BOOLEAN },
    // Additional ball data like extras, boundaries...
});
```

## Installation and Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
# Clone repository
git clone https://github.com/yourusername/CricksForGeeks.git
cd CricksForGeeks/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Start server
npm start
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Routes

The application provides the following API endpoints:

### Authentication
- POST `/api/register`: Register a new user
- POST `/api/login`: Authenticate user

### Teams
- GET `/api/getall/teams`: Get all teams
- GET `/api/get/team/:id`: Get team by ID
- POST `/api/makeTeam`: Create a new team
- PUT `/api/update/team/:id`: Update team details

### Players
- GET `/api/getall/players`: Get all players
- GET `/api/get/player/:id`: Get player by ID
- POST `/api/addPlayer`: Create a new player

### Matches
- GET `/api/getall/matches`: Get all matches
- POST `/api/get/match`: Get match by ID
- POST `/api/create/match`: Create a new match
- GET `/api/matchstats/:id`: Get statistics for a match

### Ball Recording
- POST `/api/add-ball/:id`: Record a ball for a match
- GET `/api/get/last-ball/:id`: Get the last recorded ball for a match

## Contributors

- [Your Name]
- [Team Member 1]
- [Team Member 2]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Future Enhancements

- Advanced statistics visualizations
- Support for tournament management
- Mobile application
- Live match updates
- AI-powered cricket analytics