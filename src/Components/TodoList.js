
/*****************************Imports************************* */
import TodoCard from "./TodoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import { removeList } from "./Dashboard";

/*****************************Component************************* */
function TodoList(props)
{
    return (
        <div className="todo-list">
            <div className="todo-list-title">
                <div>
                    <button onClick={() => removeList(props.title)}>
                        <FontAwesomeIcon icon={faTrash} style={{color: "black"}} />
                    </button>
                </div>
                <h4>{props.title}</h4>
                <div className="new-card-icon">
                    <button>
                        <FontAwesomeIcon icon={faPlus} style={{color: "black"}}/>
                    </button>
                </div>
            </div>
            <div className="todo-body">
                {getTodoCards(props.todos)}
            </div>
        </div>
    );
}

function getTodoCards(todos)
{   
    const cards = [];
    todos.forEach((todo) => {
        cards.push(<TodoCard title={todo.name} todoDescription={todo.dscr}/>)
    });

    return cards;
}

/*****************************Exports************************* */
export default TodoList;
