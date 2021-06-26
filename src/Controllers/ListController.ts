
/*****************************Imports*********************/
import {Request, Response} from "express";
import { Collection } from "mongodb";
import { mongodb } from "../Config/Mongo";

/*****************************Functions*********************/
async function getUserTodos(req : Request, resp : Response) : Promise<void>
{
    /*Return all the todo lists and items created by the user */

    try
    {
        //Getting user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Getting the lists document
        const listsDoc = await userCollection.findOne({lists : {$exists: true}}, {projection: {_id:0}})

        //Getting the todo cards
        const todoCardDocs : any[] = await (await userCollection.find({lists : {$exists: false}}, {projection: {_id:0}})).toArray();

        //Creating the response object
        const respObj : any = {
            success : true,
            lists: listsDoc.lists,
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

        //Adding the new list name to the lists doc
        await userCollection.updateOne({lists: {$exist: true}}, {lists: {$push: req.body.name}});

        resp.status(200).json({success: true});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }

}

/*****************************Exports*********************/
export {getUserTodos, createNewList};