
/*****************************Imports************************* */
import {Component} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faEdit} from "@fortawesome/free-solid-svg-icons"
import { displayPopup } from "./Home";
import EditTodoDialog from "./EditTodoDialog";
import {apiBaseUrl} from "../Config/Global";
import { editTodoCard } from "./Dashboard";

/*****************************Variables**************************/
const editTodoApiUrl = `${apiBaseUrl}lists/edittodo`;

/*****************************Component**************************/
class TodoCard extends Component
{
    
    constructor(props)
    {
        super(props);

        this.state = {
            title: props.title,
            dscr: props.todoDescription
        };
    }

    render()
    {
    
        return (
            <div className="todo-card">
                <h4 class="todo-card-title">{this.state.title}</h4>
                <p class="todo-card-dscr">{this.state.dscr}</p>
                <div className="todo-card-actions">
                    <button onClick={this.removeTodo}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <button onClick={this.showEditTodoDialog}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                </div>        
            </div> 
        );
    }

    removeTodo = () => this.props.todoList.deleteTodo(this.props.id);

    showEditTodoDialog = () => displayPopup(<EditTodoDialog todo={{todoId: this.props.id, title:this.state.title,dscr:this.state.dscr}} todoCard={this}/>);

    editDetails(newDetails)
    {
        /*Edits the details of the todo item */
        fetch(editTodoApiUrl, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include",
            body: JSON.stringify({todo : newDetails})
        })
        .then((resp) => {
            if(resp.status !== 200)
                throw Error(resp.status);

            //Removing the dialog
            displayPopup(null);
            
            //Updating the todo card
            newDetails.listCode = this.props.todoList.props.listCode;
            editTodoCard(newDetails);
            this.updateCardDetails(newDetails);
        })
        .catch((err) => {
            console.log(err);
            alert("Failed to edit todo. Try again !");
        });
    }

    updateCardDetails(newDetails)
    {
        /*Updates the details of the todo card */

        const newState = {}; //The new state of the card
        if(newDetails.name)
            newState.title = newDetails.name;
        if(newDetails.dscr)
            newState.dscr = newDetails.dscr;
        
        this.setState(newState);
    }

}


/*****************************Exports************************* */
export default TodoCard;