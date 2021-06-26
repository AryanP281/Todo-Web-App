
/*****************************Imports*********************/
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getCookies } from "../Services/Services";
import { Dashboard } from "./Dashboard";
import LoadingDialog from "./LoadingDialog";
import NewListDialog from "./NewListDialog";

/*****************************Component*********************/
let popupSetter;
let addNewList;
const fetchDatUrl = "http://localhost:5000/lists/all"; //The api endpoint url for fetching the user todos

/*****************************Component*********************/
function Home()
{
    const [popup, setPopup] = useState(<LoadingDialog />);
    const [todos, setTodos] = useState(null);
    const history = useHistory();

    popupSetter = setPopup;

    //Initializing functions
    addNewList = (newList) => addList(newList, todos, setTodos);

    //Fetching the user todos
    useEffect(() => fetchData(setTodos), []);

    //Checking if user has logged in
    /*
    const cookiesMap = getCookies();
    if(!cookiesMap.has("auth"))
        history.replace("/signin"); //Redirecting to sign in page
    */ 

    return (
        <div className="home">
            {todos && <Dashboard todos={todos}/>}
            {popup && (popup)}
        </div>
    );
}

function displayPopup(popup)
{
    /*Displays the provided popup component*/

    popupSetter(popup);
}

function fetchData(setTodos)
{
    /*Fetchs the users todos */

    fetch(fetchDatUrl, {
        method: "GET",
        credentials: "include"
    })
    .then((resp) =>{
        if(resp.status === 500)
            throw Error("Failed to connect to fetch data. Refresh page to Try again !");
        else
            return resp.json();
    })
    .then((data) => {
        displayTodos(data.lists, data.todos, setTodos);
    })
    .catch((err) => {
        alert(err);
    })
    
}

function displayTodos(lists, todos, setTodos)
{
    /*Displays the given todos */

    const todoLists = new Map();

    //Adding the lists to the map
    lists.forEach((list) => {
        todoLists.set(list, []);
    })

    //Adding the todos the respective lists
    todos.forEach((todo) => {
        todoLists.get(todo.list).push(todo);
    })

    //Displaying the todos
    setTodos(todoLists)

    //Closing the loading popup
    popupSetter(null);
}

function addList(newList, oldLists, setTodos)
{
    /*Adds a new list to the dashboard */

    const newLists = oldLists.map((list) => list);
    newLists.push(newList.name);

    setTodos(newLists);
}

/*****************************Exports*********************/
export default Home;
export {displayPopup, addNewList};
