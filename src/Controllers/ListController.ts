
/*****************************Imports*********************/
import {Request, Response} from "express";
import { Collection } from "mongodb";
import { mongodb } from "../Config/Mongo";

/*****************************Helper Functions*********************/
async function deleteMongoDbArrayElements(collection : Collection, docId : string, arrayName : string, keyProp: string,indices : number[]) : Promise<void>
{
    /*Removes the elements at given indices from the array in the given document */

    //Getting the required document
    const doc = await collection.findOne({_id: docId});

    //Getting the objects to be removed
    const objsToRemove : any[] = [];
    for(let i = 0; i < indices.length; ++i)
    {
        objsToRemove.push(doc[arrayName][indices[i]][keyProp]);
    }

    //Creating the pull object containing information about the values to be pulled
    const pullObject : any = {};
    pullObject[arrayName] = {};
    pullObject[arrayName][keyProp] = {$in: objsToRemove};

    //Pulling the required objects
    await collection.updateOne({_id:docId}, {$pull : pullObject});
}

/*****************************Functions*********************/
async function getUserTodos(req : Request, resp : Response) : Promise<void>
{
    /*Return all the todo lists and items created by the user */

    try
    {
        //Getting user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Getting the lists document
        const listsDoc = await userCollection.findOne({lists : {$exists: true}}, {projection: {_id:0}});

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

        //Creating the list object
        const newList : {name:string} = {name: req.body.name};

        //Adding the new list name to the lists doc
        await userCollection.updateOne({lists: {$exists: true}}, {$push: {lists : newList}});

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
        const listDoc = await userCollection.findOne({lists : {$exists: true}});
        const userLists : string[] = listDoc.lists.map((list : any) => list.name);

        //Getting the list code
        let listCode : number = 0;
        for(; userLists[listCode] !== req.body.name; ++listCode)
        {
            
        }

        //Deleting all todos with given list code
        await userCollection.deleteMany({listCode: listCode});

        //Deleting the the list from lists doc
        await deleteMongoDbArrayElements(userCollection, listDoc._id, "lists", "name",[listCode]);

        resp.sendStatus(200);
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

/*****************************Exports*********************/
export {getUserTodos, createNewList, deleteList};