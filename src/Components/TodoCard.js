
/*****************************Imports************************* */
import {Component} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons"

/*****************************Component**************************/
class TodoCard extends Component
{
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <div className="todo-card">
                <h4 class="todo-card-title">{this.props.title}</h4>
                <p class="todo-card-dscr">{this.props.todoDescription}</p>
                <div className="todo-card-actions">
                    <button onClick={this.removeTodo}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>        
            </div> 
        );
    }

    removeTodo = () => this.props.todoList.deleteTodo(this.props.id);
}

/*****************************Exports************************* */
export default TodoCard;