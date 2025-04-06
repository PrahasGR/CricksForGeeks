import express from 'express';
import  addBall  from '../controller/ball.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const ballRouter = express.Router();

// POST route to add a new ball and update corresponding statistics
ballRouter.post('/add-ball/:id', authenticate , addBall);

export default ballRouter;
