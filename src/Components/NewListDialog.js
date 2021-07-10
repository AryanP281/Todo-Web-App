
/*****************************Imports*********************/
import Popup from "./Popup";
import {displayPopup} from "./Home"
import { addNewList, listExists } from "./Dashboard";
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
    const errorCode = isValid(newList);
    if(errorCode !== 0)
    {
        switch(errorCode)
        {
            case 1 : setError("List Title cannot be empty"); break;
            case 2 : setError("List with given name already exists"); break;
        }
        return;
    }

    //Sending request to create new list
    fetch(newListApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(newList)
    })
    .then((resp) => {
        if(resp.status !== 200)
            throw Error();
        
        return resp.json();
    })
    .then((data) => {

        //Setting the code for the new list
        newList.code = data.code;

        //Displaying the new list
        addNewList(newList);

        //Closing the poput
        displayPopup(null);
    })
    .catch((err) => {
        console.log(err);
        alert("Failed to create new list. Try again")
    });
}

function isValid(details)
{
    /*Checks if the entered list details are valid */

    //Checking list name
    if(details.name.length <= 0)
        return 1;

    //Checking if list name is unique
    if(listExists(details.name))
        return 2;

    return 0;
}

/*****************************Exports*********************/
export default NewListDialog;
