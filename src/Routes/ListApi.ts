
/*****************************Imports*********************/
import { Router } from "express";
import { verifyUserToken } from "../Services/Middleware";
import { getUserTodos, createNewList, deleteList, addNewTodo, deleteTodo } from "../Controllers/ListController";

/*****************************Variables*********************/
const router : Router = Router();

/*****************************Routes*********************/
router.get("/all", verifyUserToken, getUserTodos);
router.post("/new", verifyUserToken, createNewList);
router.post("/removelist", verifyUserToken, deleteList);
router.post("/newTodo", verifyUserToken, addNewTodo);
router.post("/removetodo", verifyUserToken, deleteTodo);

/*****************************Exports*********************/
export {router as ListApiRouter};
