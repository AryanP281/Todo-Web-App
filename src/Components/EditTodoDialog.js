

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

                <button onClick={() => editTodoDetails(props.todo, props.todoCard, setError)}>Edit Todo Card</button>
            </div>
        </Popup>
    );
}

function editTodoDetails(todo, todoCard, setError)
{
    /*Checks if the detail edits are valid and then makes the edits */

    //Getting new todo details
    const newDetails = {
        id : todo.todoId,
        name : document.getElementById("todo-title").value.trim(),
        dscr : document.getElementById("todo-dscr").value.trim()
    };

    //Checking if the title is empty
    if(newDetails.name.length === 0)
    {
        setError("New title cannot be empty");
        return;
    }

    //Checking if the details have changed
    if(newDetails.name === todo.title && newDetails.dscr === todo.dscr)
        displayPopup(null);
    else
    {
        if(newDetails.name === todo.title)
            delete newDetails.name;
        else if(newDetails.dscr === todo.dscr)
            delete newDetails.dscr;

        todoCard.editDetails(newDetails);
    }
}

/*****************************Exports************************* */
export default EditTodoDialog;