
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
        const todoCardDocs : any[] = await (await userCollection.find({lastIndex : {$exists: false}}).sort({order : 1})).toArray();
        //Renaming the _id property to id
        todoCardDocs.forEach((todoCard) => {
            todoCard["id"] = todoCard._id.toString();
            delete todoCard._id;
            delete todoCard.order;
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
        updateObj[newList.name] = {code: Number.parseInt(listsDoc.lastIndex) + 1, cards : 0};
        await userCollection.updateOne({lastIndex : {$exists: true}}, {$set : updateObj, $inc : {lastIndex : 1}});

        resp.status(200).json({success: true, code : updateObj[newList.name].code});
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
        const todoItem : {name : string, dscr : string, listCode : number, order : number | undefined} = req.body.todo;

        //Getting the user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Getting the list documnet
        const listsDoc = await userCollection.findOne({lastIndex : {$exists : true}}, {projection: {_id:0, lastIndex:0}});

        //Getting the order of the todo item
        const lists : [string, any][] = Object.entries(listsDoc);
        for(let i = 0; i < lists.length; ++i)
        {
            if(lists[i][1].code === todoItem.listCode)
            {
                todoItem.order = lists[i][1].cards;

                //Updating the list card count
                const incObj : any = {};
                incObj[`${lists[i][0]}.cards`] = 1;
                await userCollection.updateOne({lastIndex : {$exists : true}}, {$inc : incObj});

                break;
            }
        }

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

        //Getting the todo item document
        const todoDocument = await userCollection.findOne({_id : new ObjectId(req.body.todoId)});
        //Checking if document exists
        if(todoDocument === null)
        {
            resp.sendStatus(200);
            return;
        }

        //Updating the orders of the remaining documents
        await userCollection.updateMany({$and : [{listCode : todoDocument.listCode}, {order : {$gt : todoDocument.order}}]}, {$inc : {order : -1}});

        //Updating the list cards count
        const lists : [string, any][] = Object.entries(await userCollection.findOne({lastIndex : {$exists : true}}, {projection: {_id:0, lastIndex:0}}) as any);
        for(let i = 0; i < lists.length; ++i)
        {
            if(lists[i][1].code === todoDocument.listCode)
            {
                const incObj : any = {};
                incObj[`${lists[i][0]}.cards`] = -1;
                await userCollection.updateOne({lastIndex : {$exists : true}}, {$inc : incObj});
                break;
            }
        }

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

async function moveTodos(req : Request, resp : Response) : Promise<void>
{
    /*Handles inter and intra list movement of todo cards */
    
    try
    {   
        const todoItemsMap : Map<string, {src: number,dest:number,destOrder:number,srcOrder:number}> = new Map();

        //Mapping the final state of each changed item
        const itemChanges : {todoId:string,src:number, dest:number, destOrder:number,srcOrder:number}[] = req.body.itemChanges;
        itemChanges.forEach((change) => {
            if(todoItemsMap.has(change.todoId))
            {
                const todoItem = todoItemsMap.get(change.todoId);
                todoItem!.dest = change.dest;
                todoItem!.destOrder = change.destOrder; 
            }
            else
                todoItemsMap.set(change.todoId, {src : change.src, dest : change.dest, destOrder : change.destOrder, srcOrder :change.srcOrder});
        });

        //Getting the user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);


        //Updating the todo items' documents
        const listCardCountChanges : Map<number,number> = new Map<number,number>();
        for(const [key,value] of todoItemsMap) 
        {   
            //Checking if the todo item exists or has been deleted
            if((await userCollection.findOne({_id : new ObjectId(key)})) === null)
                continue;
            
            //Shifting todo cards
            if(value.src === value.dest)
            {
                if(value.srcOrder < value.destOrder)
                {
                    await userCollection.updateMany({$and : [{listCode : value.dest}, {order : {$lte : value.destOrder, $gt : value.srcOrder}}]}, 
                        {$inc : {order:-1}});
                }
                else if(value.srcOrder > value.destOrder)
                {
                    await userCollection.updateMany({$and : [{listCode : value.dest}, {order : {$lt: value.srcOrder, $gte: value.destOrder}}]},
                        {$inc : {order:1}});
                }
            }
            else
            {
                await userCollection.updateMany({$and : [{listCode : value.dest}, {order : {$gte : value.destOrder}}]}, {$inc : {order:1}});
                await userCollection.updateMany({$and : [{listCode : value.src}, {order : {$gt : value.srcOrder}}]}, {$inc : {order:-1}});
            }

            //Positioning the moved card
            await userCollection.updateOne({_id : new ObjectId(key)}, {$set : {order:value.destOrder, listCode: value.dest}});

            //Updating the source list card count change
            if(listCardCountChanges.has(value.src))
                listCardCountChanges.set(value.src, listCardCountChanges.get(value.src)!-1);
            else
                listCardCountChanges.set(value.src, -1);

            //Updating the destination list card count change
            if(listCardCountChanges.has(value.dest))
                listCardCountChanges.set(value.dest, listCardCountChanges.get(value.dest)!+1);
            else
                listCardCountChanges.set(value.dest, 1);

        };

        //Updating the list card counts
        if(listCardCountChanges.size > 0)
        {
            const listsDoc = await userCollection.findOne({lastIndex : {$exists : true}}, {projection: {lastIndex:0}});
            const docId : ObjectId = listsDoc._id; //Getting the id of the document
            delete listsDoc._id;
            const setObj : any = {};
            Object.entries(listsDoc).forEach((list : [string, any]) => {
                if(listCardCountChanges.has(list[1].code))
                    setObj[`${list[0]}.cards`] = list[1].cards + listCardCountChanges.get(list[1].code);
            });
            await userCollection.updateOne({_id : docId}, {$set : setObj});
        }

        resp.sendStatus(200);
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(200);
    }
}

async function editTodoItem(req : Request, resp : Response) : Promise<void>
{
    /*Edits the details of the given todo item */

    try
    {
        //Getting the user collection
        const userCollection : Collection = await mongodb.db().collection(req.body.userId);

        //Updating the todo item document
        const setObj : any = {};
        if(req.body.todo.name)
            setObj.name = req.body.todo.name;
        if(req.body.todo.dscr)
            setObj.dscr = req.body.todo.dscr;
        
        await userCollection.updateOne({_id : new ObjectId(req.body.todo.id)}, {$set : setObj});

        resp.sendStatus(200);
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

/*****************************Exports*********************/
export {getUserTodos, createNewList, deleteList, addNewTodo, deleteTodo, moveTodos, editTodoItem};

