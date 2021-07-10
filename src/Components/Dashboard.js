
/*****************************Imports*********************/
import { useState, useEffect } from "react";
import { displayPopup } from "./Home";
import TodoList from "./TodoList";
import SideNavBar from "./SideNavBar";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/*****************************Variables*********************/
let addNewList; //The function exported to add new lists to the dashboard
let listExists; //A function which returns if a list with the given name has already been created by the user
let removeList; //A function which removes the provided user todo list
const listsMap = new Map(); //The lists mapped by their names
const todoItemChangesBuffer = []; //Buffer for storing the changes to todo items so as to be written out to the database periodically
let writingChangesToDb = false; //Indicates whether the previous write is still going on
const fetchDatUrl = "http://localhost:5000/lists/all"; //The api endpoint url for fetching the user todos
const deleteListUrl = "http://localhost:5000/lists/removelist"; //The api endpoint url for deleting a list
const todoItemChangesUrl = "http://localhost:5000/lists/movetodos"; //The api endpoints for todo card movement

/*****************************Component*********************/
function Dashboard()
{
    console.log("State changed")
    
    const [todos, setTodos] = useState(null);

    //Initializing functions
    addNewList = (newList) => addList(newList, todos, setTodos);
    listExists = (listName) => listsMap.has(listName);
    removeList = (listName) => deleteList(listName, todos, setTodos);

    //Fetching the user todos
    useEffect(() => fetchData(setTodos), []);

    //Periodically writing the card position changes to database
    writeCardSwaps();

    useEffect(() => {
        window.addEventListener("beforeunload", (event) => {
            
        });
    },[]);

    return (
        <div className="dashboard">
            <SideNavBar />
            <DragDropContext onDragEnd={(result) => onDragEnd(result, todos, setTodos)}>
                {todos && getLists(todos)}
            </DragDropContext>
        </div>
    );
}

function fetchData(setTodos)
{
    /*Fetchs the users todos */

    fetch(fetchDatUrl, {
        method: "GET",
        credentials: "include"
    })
    .then((resp) =>{
        if(resp.status !== 200)
            throw Error();
        else
            return resp.json();
    })
    .then((data) => {
        displayTodos(data.lists, data.todos, setTodos);
    })
    .catch((err) => {
        console.log(err)
        alert("Failed to connect to fetch data. Refresh page to Try again !");
    })
    
}

function displayTodos(lists, todos, setTodos)
{
    /*Displays the given todos */

    const todoLists = new Map();

    //Mapping lists
    lists.forEach((list, index) => {
        todoLists.set(list.code, {list, todos: []});
    });

    //Inserting todos
    todos.forEach((todo) => {
        todoLists.get(todo.listCode).todos.push(todo);
    });

    //Displaying the todos
    setTodos(todoLists)

    //Closing the loading popup
    displayPopup(null);
}

function addList(newList, oldLists, setTodos)
{
    /*Adds a new list to the dashboard */

    const newLists = [];
    oldLists.forEach((list) => {
        newLists.push(list);
    });
    newLists.push({list:newList, todos: []});

    setTodos(newLists);
}

function getLists(todos)
{
    /*Returns the array of TodoList items to be displayed */

    const todoLists = [];
    todos.forEach((todo, key) => {
        todoLists.push(
            <Droppable droppableId={`${key}`}>
                {(provided) => (
                    <div className="todoListDroppable" {...provided.droppableProps} ref={provided.innerRef}>
                        <TodoList title={todo.list.name} todos={todo.todos} listCode={todo.list.code}/>
                    </div>
                )}
            </Droppable>
        );
    });

    return todoLists;

}

function deleteList(listName, todos, setTodos)
{
    /*Deletes the list with the given name */

    removeListElement(listName, todos, setTodos);

    //Sending request to delete list and its todos from database
    fetch(deleteListUrl, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        credentials: "include",
        body: JSON.stringify({name: listName})
    })
    .then((resp) => {
        if(resp.status !== 200)
            throw Error();
        removeListElement(listName, todos, setTodos);
    })
    .catch((err) => {
        console.log(err);
        alert("Unable to delete list. Try again");
    })

}

function removeListElement(listName, todos, setTodos)
{
    /*Removes the given TodoList element from the dashboard */

    const newTodos = [];
    todos.forEach((todoList) => {
        if(todoList.list.name !== listName)
            newTodos.push(todoList);
    })

    setTodos(newTodos);
}

function onDragEnd(result, todos, setTodos)
{
    /*Handles the exchange of todo cards between items */

    if(!result.destination)
        return;

    console.log(result)

    const [sourceList, destinationList] = bufferChange(result); //Adding the change to buffer

    //Repositioning the todo card
    repostionCard(sourceList, destinationList, {src : result.source.index, dest: result.destination.index}, todos, setTodos);
}

function writeCardSwaps()
{
    /*Writes the performed card swaps to database periodically */

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 5000));
    timeoutPromise.then(() => {
        flushItemChangesBuffer();
    });
}

function bufferChange(result)
{
    /*Adds the change in a todo cards state to the buffer*/

    const sourceList = Number.parseInt(result.source.droppableId); //Getting the index of the source list
    const destinationList = Number.parseInt(result.destination.droppableId); //Getting the index of the destination list

    todoItemChangesBuffer.push({todoId : result.draggableId, src: sourceList, dest : destinationList, 
        destOrder : result.destination.index, srcOrder : result.source.index}); //Adding the change to buffer

    return [sourceList, destinationList];
}

function repostionCard(source, destination, orders, todos, setTodos)
{
    /*Repositions the given card from source to destination at position order*/

    //Creating the new todos
    const newTodos = new Map();
    todos.forEach((value, key) => {
        newTodos.set(key, value);
    });
    
    //Removing the card from old postion
    console.log(orders)
    const todoItem = todos.get(source).todos[orders.src];
    todos.get(source).todos.splice(orders.src, 1);
    console.log(todos.get(source))

    //Adding the card at new position
    todos.get(destination).todos.splice(orders.dest, 0, todoItem);

    setTodos(newTodos);
}

function flushItemChangesBuffer()
{
    /*Sends the todo item changes to backend */
    
    //Checking if the buffer contains items to be written out
    if(todoItemChangesBuffer.length > 0 && !writingChangesToDb)
    {
        //Setting the semaphore
        writingChangesToDb = true;
        
        fetch(todoItemChangesUrl, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include",
            body: JSON.stringify({itemChanges : todoItemChangesBuffer})
        })
        .then((resp) => {
            if(resp.status === 200)
            {
                //Clearing the buffer
                todoItemChangesBuffer.splice(0, todoItemChangesBuffer.length);

                //Releasing the semaphore
                writingChangesToDb = false;

                //Rerunning loop
                writeCardSwaps();
            }
            else
                throw Error(resp.status);
        })
        .catch((err) => {
            console.log(err);

            //Releasing the semaphore
            writingChangesToDb = false;

            //Rerunning loop
            writeCardSwaps();
        });
    }

}

/*****************************Exports*********************/
export {Dashboard, addNewList, listExists, removeList};