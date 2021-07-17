
/*****************************Imports*********************/
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserCircle} from "@fortawesome/free-solid-svg-icons";
import { displayPopup } from "./Home";
import NewListDialog from "./NewListDialog";
import {apiBaseUrl} from "../Config/Global";
import { useHistory } from "react-router";

/*****************************Variables*********************/
const logoutApiUrl = `${apiBaseUrl}auth/logout`; //The api endpoint url to logout the user

/*****************************Component*********************/
function SideNavBar()
{
    const history = useHistory();

    return (
        <div className="side-nav-bar">
            <div className="user-details">
                <FontAwesomeIcon icon={faUserCircle} size="5x" />
                <h3>Aryan Pathare</h3>
            </div>
            <div className="side-nav-bar-controls">
                <button onClick={newList}>New List</button>
                <button onClick={() => logout(history)}>Log Out</button>
            </div>
        </div>
    );
}

function logout(history)
{
    /*Logs the user out*/

    fetch(logoutApiUrl, {
        method: "GET",
        credentials: "include"
    })
    .then((resp) => resp.json())
    .then((data) => {
        if(data.code != 0)
            throw Error(data.code);
        
        //Redirecting to login page
        history.replace("/signin");
    })
    .catch((err) => console.log(err));
}

function newList()
{
    /*Creates a new todo list and adds to dashboard*/

    displayPopup(<NewListDialog />)
}

/*****************************Exports*********************/
export default SideNavBar;