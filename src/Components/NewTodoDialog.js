
/*****************************Imports************************* */
import { useState } from "react";
import { displayPopup } from "./Home";
import Popup from "./Popup";

/*****************************Component************************* */
function NewTodoDialog(props)
{
    const [error, setError] = useState(null);
    
    return (
        <Popup title={"New Todo Card"} onClose={() => displayPopup(null)} >
            <div className="new-list-dialog-box">
                <form>
                    <input type="text" id="new-todo-title" placeholder="Enter Todo title" className={error ? "invalid-input" : ""} />
                    <textarea id="new-todo-dscr" cols="30" rows="10" placeholder="Enter Description" />
                </form>

                {error && <p>{error}</p>}

                <button onClick={() => addNewTodo(props.createNewTodo,setError)}>Create New Todo Card</button>
            </div>
        </Popup>
    );
}

function addNewTodo(createNewTodo, setError)
{
    //Getting the entered details
    const newTodo = {
        name: document.getElementById("new-todo-title").value.trim(),
        dscr: document.getElementById("new-todo-dscr").value.trim()
    };

    //Checking if the details are valid
    if(!isValid(newTodo))
    {
        setError("Todo Card title cannot be empty");
        return;
    }

    //Creating the new todo
    createNewTodo(newTodo);
}

function isValid(todoDetails)
{
    /*Checks if the entered todo details are valid */

    return todoDetails.name.length > 0;
}

/*****************************Exports************************* */
export default NewTodoDialog;
