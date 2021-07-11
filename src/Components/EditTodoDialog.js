

/*****************************Imports************************* */
import { useState } from "react";
import { displayPopup } from "./Home";
import Popup from "./Popup";

/*****************************Component************************* */
function EditTodoDialog(props)
{
    const [error, setError] = useState(null);
    
    return (
        <Popup title="Edit Todo" onClose={() => displayPopup(null)}>
            <div className="new-list-dialog-box">
                <form>
                    <input type="text" id="todo-title" defaultValue={props.todo.title} className={error ? "invalid-input" : ""} />
                    <textarea id="todo-dscr" cols="30" rows="10" defaultValue={props.todo.dscr}/>
                </form>

                {error && <p>{error}</p>}

                <button onClick={() => editTodoDetails(props.todo, props.todoCard, setError)}>Create New Todo Card</button>
            </div>
        </Popup>
    );
}

function editTodoDetails(todo, todoCard, setError)
{
    /*Checks if the detail edits are valid and then makes the edits */

    //Getting new todo details
    const newDetails = {
        todoId : todo.todoId,
        title : document.getElementById("todo-title").value.trim(),
        dscr : document.getElementById("todo-dscr").value.trim()
    };

    console.log(newDetails)

    //Checking if the title is empty
    if(newDetails.title.length === 0)
    {
        setError("New title cannot be empty");
        return;
    }

    //Checking if the details have changed
    if(newDetails.title === todo.title && newDetails.dscr === todo.dscr)
        displayPopup(null);
    else
    {
        if(newDetails.title === todo.title)
            delete newDetails.title;
        else if(newDetails.dscr === todo.dscr)
            delete newDetails.dscr;

        todoCard.editDetails(newDetails);
    }
}

/*****************************Exports************************* */
export default EditTodoDialog;