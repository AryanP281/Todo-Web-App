
/*****************************Imports*********************/
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserCircle} from "@fortawesome/free-solid-svg-icons";
import { addTodoList } from "./Dashboard";
import { displayPopup } from "./Home";
import NewListDialog from "./NewListDialog";

/*****************************Variables*********************/
const logoutApiUrl = "";

/*****************************Component*********************/
function SideNavBar()
{
    
    return (
        <div className="side-nav-bar">
            <div className="user-details">
                <FontAwesomeIcon icon={faUserCircle} size="5x" />
                <h3>Aryan Pathare</h3>
            </div>
            <div className="side-nav-bar-controls">
                <button onClick={newList}>New List</button>
                <button onClick={logout}>Log Out</button>
            </div>
        </div>
    );
}

function logout()
{
    /*Logs the user out*/

    fetch("http://localhost:5000/auth/logout", {
        method: "GET",
        credentials: "include"
    }).then((resp) => resp.json())
        .then((data) => console.log(data))
        .catch((err) => console.log(err));
}

function newList()
{
    /*Creates a new todo list and adds to dashboard*/

    displayPopup(<NewListDialog />)
}

/*****************************Exports*********************/
export default SideNavBar;