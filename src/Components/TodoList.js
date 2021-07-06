
/*****************************Imports************************* */
import TodoCard from "./TodoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import { removeList } from "./Dashboard";
import { useState, Component } from "react";
import { displayPopup } from "./Home";
import NewTodoDialog from "./NewTodoDialog";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/*****************************Variables************************* */
const addTodoApiUrl = "http://localhost:5000/lists/newTodo";
const removeTodoApiUrl = "http://localhost:5000/lists/removetodo";

/*****************************Component************************* */
class TodoList extends Component 
{
    constructor(props) 
    {
        super(props);
        this.state = {
            todos : props.todos
        }
    }

    render() 
    {
        
        return (
            <div className="todo-list">
                <div className="todo-list-title">
                    <div>
                        <button onClick={() => removeList(this.props.title)}>
                            <FontAwesomeIcon icon={faTrash} style={{color: "black"}} />
                        </button>
                    </div>
                    <h4>{this.props.title}</h4>
                    <div className="new-card-icon">
                        <button onClick={this.showNewTodoDialog}>
                            <FontAwesomeIcon icon={faPlus} style={{color: "black"}}/>
                        </button>
                    </div>
                </div>
                <DragDropContext>
                    <Droppable droppableId="todoCards">
                        {(provider) => (
                            <div className="todoCards" {...provider.droppableProps} ref={provider.innerRef}>
                                {this.getTodoCards()}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }

    getTodoCards()
    {
        return this.state.todos.map((todo,index) => {
            return (
                <Draggable key={todo.id} draggableId={todo.id} index={index} >
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <TodoCard title={todo.name} todoDescription={todo.dscr} id={todo.id} todoList={this}/>
                        </div>
                    )}
                </Draggable>
            )
        });
        
    }

    addNewTodo(newTodo) 
    {
        /*Adds the new todo to database and displays it */

        //Adding list code to the new todo
        newTodo["listCode"] = this.props.listCode;

        //Api request to add todo item to database
        fetch(addTodoApiUrl, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include",
            body: JSON.stringify({todo: newTodo})
        })
        .then((resp) => {
            if(resp.status !== 200)
                throw Error();
            
            return resp.json();
        })
        .then((data) => {
            newTodo["id"] = data.id;

            this.displayNewTodo(newTodo);

            //Closing the new todo dialog
            displayPopup(null);
        })
        .catch((err) => {
            console.log(err);
            alert("Failed to create todo card. Try again !");
        })
    }

    displayNewTodo(newTodo)
    {
        /*Displays the given new todo card */

        const newTodos = [];
        this.state.todos.forEach((todo) => {
            newTodos.push(todo);
        });
        newTodos.push(newTodo);

        this.setState({todos: newTodos})
    }

    deleteTodo(todoId)
    {
        /*Deletes the todo with the given id */

        //Sending request to delete todo
        fetch(removeTodoApiUrl, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include",
            body: JSON.stringify({todoId})
        })
        .then((resp) => {
            if(resp.status !== 200)
                throw Error();
            console.log(resp.status)
            
            this.removeTodo(todoId);
        })
        .catch((err) => {
            console.log(err);
            alert("Failed to delete todo card. Try again !");
        })

    }

    showNewTodoDialog = () => displayPopup(<NewTodoDialog createNewTodo={this.addNewTodo.bind(this)}/>);

    removeTodo(todoId)
    {
        /*Removes the given todo card from the list of todos */

        const newTodos = []
        this.state.todos.forEach((todo) => {
            if(todo.id !== todoId)
                newTodos.push(todo);
        });

        this.setState({todos: newTodos});
    }
}


/*****************************Exports************************* */
export default TodoList;
