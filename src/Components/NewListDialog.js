
/*****************************Imports*********************/
import Popup from "./Popup";
import {addNewList, displayPopup} from "./Home"
import { useState } from "react";

/*****************************Variables*********************/
const newListApiUrl = "http://localhost:5000/lists/new"; //The api url to add a new list

/*****************************Component*********************/
function NewListDialog()
{
    const [error, setError] = useState(null);
    
    return (
        <div className="new-list-dialog">
            <Popup title="New List" onClose={closeDialog}>
                <div className="new-list-dialog-box">
                    <form>
                        <input type="text" id="new-list-title" placeholder="Enter Title" className={error ? "invalid-input" : ""}/>
                    </form>

                    {error && <p>{error}</p>}

                    <button onClick={() => createList(setError)}>Create list</button>
                </div>
            </Popup>
        </div>
    );
}

function closeDialog()
{
    /*Closes the new list dialog box*/

    displayPopup(null); 
}

function createList(setError)
{
    /*Creates a new list according to the entered details */
    
    //Creating the list object
    const newList = {
        name: document.getElementById("new-list-title").value.trim()       
    };

    //Checking if details are valid
    if(!isValid(newList))
    {
        setError("List title cannot be empty")
        return;
    }

    //Sending request to create new list
    fetch(newListApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify()
    })
    .then((resp) => {
        if(resp.status !== 200)
            throw Error();
        //Displaying the new list
        addNewList(newList);
    })
    .catch((err) => {
        alert("Failed to create new list. Try again")
    })
}

function isValid(details)
{
    /*Checks if the entered list details are valid */

    //Checking list name
    return details.name.length > 0;
}

/*****************************Exports*********************/
export default NewListDialog;
