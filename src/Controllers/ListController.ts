
/*****************************Imports*********************/
import {Request, Response} from "express";
import { Collection, ObjectId } from "mongodb";
import { mongodb } from "../Config/Mongo";

/*****************************Helper Functions*********************/


/*****************************Functions*********************/
async function getUserTodos(req : Request, resp : Response) : Promise<void>
{
    /*Return all the todo lists and items created by the user */

    try
    {
        //Getting user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Getting the lists document
        const listsDoc = await userCollection.findOne({lastIndex : {$exists: true}}, {projection: {_id:0, lastIndex: 0}});
        
        //Creating the lists objects to be returned
        const lists : {name : string, code : number}[] = [];
        Object.entries(listsDoc).forEach((entry : [string, any]) => {
            lists.push({name: entry[0], code : entry[1].code as number});
        });

        //Getting the todo cards
        const todoCardDocs : any[] = await (await userCollection.find({lastIndex : {$exists: false}})).toArray();
        //Renaming the _id property to id
        todoCardDocs.forEach((todoCard) => {
            todoCard["id"] = todoCard._id.toString();
            delete todoCard._id;
        });

        //Creating the response object
        const respObj : any = {
            success : true,
            lists: lists,
            todos: todoCardDocs
        };
        resp.status(200).json(respObj);

    }
    catch(err)
    {
        resp.sendStatus(500); //Sending server error message
    }

}

async function createNewList(req : Request, resp : Response) : Promise<void>
{
    /*Adds a new list to the users list*/

    try
    {
        //Getting the user's collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Creating the list object
        const newList : {name:string} = {name: req.body.name};

        //Getting the lists doc
        const listsDoc = await userCollection.findOne({lastIndex : {$exists: true}});

        //Adding the new list name to the lists doc
        const updateObj : any = {};
        updateObj[newList.name] = {code: listsDoc.lastIndex + 1};
        await userCollection.updateOne({lastIndex : {$exists: true}}, {$set : updateObj, $inc : {lastIndex : 1}});

        resp.status(200).json({success: true});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }

}

async function deleteList(req : Request, resp : Response) : Promise<void>
{
    /*Deletes the given list and all of its todos from the users account */
    
    try
    {
        //Getting the user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Getting the lists
        const listDoc = await userCollection.findOne({lastIndex : {$exists: true}}, {projection : {_id : 0, lastIndex : 0}});
        const userLists : string[] = []
        Object.entries(listDoc).forEach(([key, value]) => {
            userLists.push(key);
        })

        //Getting the list code
        let listCode : number = 0;
        for(; userLists[listCode] !== req.body.name; ++listCode)
        {
        }

        //Deleting all todos with given list code
        await userCollection.deleteMany({listCode: listCode});

        //Deleting the the list from lists doc
        const unsetObj : any = {}
        unsetObj[req.body.name] = "";
        await userCollection.updateOne({lastIndex : {$exists : true}}, {$unset : unsetObj})

        resp.sendStatus(200);
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function addNewTodo(req : Request, resp : Response) : Promise<void>
{
    /*Adds the new todo item to the database*/

    try
    {
        //Getting the todo object
        const todoItem : {name : string, dscr : string, listCode : number} = req.body.todo;

        //Getting the user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Writing the todo object
        const todoDoc = await userCollection.insertOne(todoItem);

        resp.status(200).json({success: true, id: todoDoc.ops[0]._id.toString()});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function deleteTodo(req : Request, resp : Response) : Promise<void>
{
    /*Deletes the given todo item */

    try
    {
        //Getting the user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Deleting the todo item document
        await userCollection.deleteOne({_id : new ObjectId(req.body.todoId)});

        resp.sendStatus(200);
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

/*****************************Exports*********************/
export {getUserTodos, createNewList, deleteList, addNewTodo, deleteTodo};