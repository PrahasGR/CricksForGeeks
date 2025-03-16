import express from 'express';
import { register, login, logout } from '../controller/auth.controller.js';

const authroutes = express.Router();

authroutes.post('/register', register);

authroutes.post('/login', login);

authroutes.post('/logout', logout); 

export default authroutes;
