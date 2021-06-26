
/*****************************Imports*********************/
import {Router} from "express";
import { createUserAccount, loginUser, logoutUser } from "../Controllers/AuthController";
import { verifyUserToken } from "../Services/Middleware";

/*****************************Variables*********************/
const router : Router = Router(); //Creating a router

/*****************************Routes*********************/
router.post("/signup", createUserAccount);
router.post("/signin", loginUser);
router.get("/logout", verifyUserToken, logoutUser)

/*****************************Exports*********************/
export {router as AuthApiRouter};
