import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

app.use(express.json());  
app.use(cookieParser());  

app.use('/api', authRoutes);

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
