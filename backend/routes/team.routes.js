import express from "express";
import { makeTeam } from "../controller/team.controller.js";

const teamRouter = express.Router()

teamRouter.post('/makeTeam', makeTeam)

export default teamRouter