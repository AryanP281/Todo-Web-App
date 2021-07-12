
/*****************************Imports*********************/
import { Router } from "express";
import { verifyUserToken } from "../Services/Middleware";
import { getUserTodos, createNewList, deleteList, addNewTodo, deleteTodo, moveTodos, editTodoItem } from "../Controllers/ListController";

/*****************************Variables*********************/
const router : Router = Router();

/*****************************Routes*********************/
router.get("/all", verifyUserToken, getUserTodos);
router.post("/new", verifyUserToken, createNewList);
router.post("/removelist", verifyUserToken, deleteList);
router.post("/newTodo", verifyUserToken, addNewTodo);
router.post("/removetodo", verifyUserToken, deleteTodo);
router.post("/movetodos", verifyUserToken, moveTodos);
router.post("/edittodo", verifyUserToken, editTodoItem);

/*****************************Exports*********************/
export {router as ListApiRouter};
