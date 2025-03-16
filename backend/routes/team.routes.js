import express from "express";
import { makeTeam, getAllTeams, getTeam, updateTeam } from "../controller/team.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const teamRouter = express.Router()

teamRouter.post('/makeTeam',authenticate, makeTeam)
teamRouter.get('/getall/teams', authenticate, getAllTeams)
teamRouter.get('/get/team/:id', authenticate, getTeam)
teamRouter.put("/update/team/:id", authenticate, updateTeam);

export default teamRouter