
/*****************************Imports*********************/
import { Router } from "express";
import { verifyUserToken } from "../Services/Middleware";
import { getUserTodos, createNewList } from "../Controllers/ListController";

/*****************************Variables*********************/
const router : Router = Router();

/*****************************Routes*********************/
router.get("/all", verifyUserToken, getUserTodos);
router.post("/new", verifyUserToken, createNewList)

/*****************************Exports*********************/
export {router as ListApiRouter};
