import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import router from './routes/match.routes.js';
import playerRouter from './routes/players.routes.js';
import teamRouter from './routes/team.routes.js';

dotenv.config();

const app = express();

app.use(express.json());  
app.use(cookieParser());  

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 },
    })
)

app.use('/api', authRoutes);
app.use('/api', router);
app.use('/api', playerRouter);
app.use('/api', teamRouter)

// Sync Database & Start Server
const PORT = process.env.PORT || 5000;
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully.");
        await sequelize.sync({ force: false });
        console.log("✅ Tables are synced.");
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error connecting to database:", error);
    }
})();
