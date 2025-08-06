import { Router } from "express";
import { adminLogin, getAdminProfile, adminLogout } from "../../controllers/adminController/adminController.js";

const route = Router();

// Admin authentication routes
route.post("/login", adminLogin);
route.get("/profile", getAdminProfile);
route.post("/logout", adminLogout);

export default route;
