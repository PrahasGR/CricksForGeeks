import express from 'express';
import  addBall  from '../controller/ball.controller.js';

const ballRouter = express.Router();

// POST route to add a new ball and update corresponding statistics
ballRouter.patch('/add-ball', addBall);

export default ballRouter;
