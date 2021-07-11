
/*****************************Imports************************* */
import {Component} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash, faEdit} from "@fortawesome/free-solid-svg-icons"
import { displayPopup } from "./Home";
import EditTodoDialog from "./EditTodoDialog";

/*****************************Component**************************/
class TodoCard extends Component
{
    static editTodoApiUrl = "http://localhost:5000/lists/edittodo";
    
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

    showEditTodoDialog = () => displayPopup(<EditTodoDialog todo={{todoId: this.props.id, title:this.state.title,dscr:this.state.todoDescription}} todoCard={this}/>);

    editDetails(newDetails)
    {
        /*Edits the details of the todo item */
        fetch(TodoCard.editTodoApiUrl, {
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
            
            //Updating the todo state
            const newState = {};
            if(newDetails.title)
                newState.title = newDetails.title;
            if(newDetails.dscr)
                newState.dscr = newDetails.dscr;
            this.setState(newState);
        })
        .catch((err) => {
            console.log(err);
            alert("Failed to edit todo. Try again !");
        });
    }
}

/*****************************Exports************************* */
export default TodoCard;