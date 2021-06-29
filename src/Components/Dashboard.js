
/*****************************Imports*********************/
import { useState, useEffect } from "react";
import { displayPopup } from "./Home";
import NewListDialog from "./NewListDialog";
import SideNavBar from "./SideNavBar";
import TodoList from "./TodoList";

/*****************************Variables*********************/
let addNewList; //The function exported to add new lists to the dashboard
let listExists; //A function which returns if a list with the given name has already been created by the user
let removeList; //A function which removes the provided user todo list
const listsMap = new Map(); //The lists mappedb by their names
const fetchDatUrl = "http://localhost:5000/lists/all"; //The api endpoint url for fetching the user todos
const deleteListUrl = "http://localhost:5000/lists/removelist"; //The api endpoint url for deleting a list

/*****************************Component*********************/
function Dashboard()
{
    const [todos, setTodos] = useState(null);

    //Initializing functions
    addNewList = (newList) => addList(newList, todos, setTodos);
    listExists = (listName) => listsMap.has(listName);
    removeList = (listName) => deleteList(listName, todos, setTodos);

    //Fetching the user todos
    useEffect(() => fetchData(setTodos), []);

    return (
        <div className="dashboard">
            <SideNavBar />
            {todos && getLists(todos)}
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
        alert("Failed to connect to fetch data. Refresh page to Try again !");
    })
    
}

function displayTodos(lists, todos, setTodos)
{
    /*Displays the given todos */

    const todoLists = [];

    //Mapping lists
    lists.forEach((list, index) => {
        todoLists.push({list, todos: []});
        listsMap.set(list.name, index);
    });

    //Inserting todos
    todos.forEach((todo) => {
        todoLists[todo.listCode].todos.push(todo);
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

    const lists = []
    todos.forEach((todo) => {
        lists.push(<TodoList title={todo.list.name} todos={todo.todos}/>);
    });

    return lists;
}

function deleteList(listName, todos, setTodos)
{
    /*Deletes the list with the given name */

    removeListElement(listName, todos, setTodos);

    //Sending request to delete list and its todos from database
    /*fetch(deleteListUrl, {
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
    })*/

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

/*****************************Exports*********************/
export {Dashboard, addNewList, listExists, removeList};