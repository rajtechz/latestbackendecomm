import { Router } from "express";
import { Login, Signup } from "../../controllers/userController/userController.js";

const route = Router();

route.post("/signup", Signup);
route.post("/login",Login)

export default route;