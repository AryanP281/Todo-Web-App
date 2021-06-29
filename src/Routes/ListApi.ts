
/*****************************Imports*********************/
import { Router } from "express";
import { verifyUserToken } from "../Services/Middleware";
import { getUserTodos, createNewList, deleteList } from "../Controllers/ListController";

/*****************************Variables*********************/
const router : Router = Router();

/*****************************Routes*********************/
router.get("/all", verifyUserToken, getUserTodos);
router.post("/new", verifyUserToken, createNewList);
router.post("/removelist", verifyUserToken, deleteList);

/*****************************Exports*********************/
export {router as ListApiRouter};
