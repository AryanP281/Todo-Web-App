
/*****************************Imports************************* */
import TodoCard from "./TodoCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import { removeList } from "./Dashboard";
import { useState, Component } from "react";
import { displayPopup } from "./Home";
import NewTodoDialog from "./NewTodoDialog";
import { Draggable } from "react-beautiful-dnd";
import {apiBaseUrl} from "../Config/Global";
import {insertNewTodo, removeTodo} from "./Dashboard";

/*****************************Variables************************* */
const addTodoApiUrl = `${apiBaseUrl}lists/newTodo`;
const removeTodoApiUrl = `${apiBaseUrl}lists/removetodo`;

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
                {this.getTodoCards()}
            </div>
        );
    }

    getTodoCards()
    {
        try
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
        catch(err)
        {
            console.log(err)
            console.log(this.state.todos)
        }
        
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

            this.updateList({addNew:true, newTodo});
            insertNewTodo(newTodo);

            //Closing the new todo dialog
            displayPopup(null);
        })
        .catch((err) => {
            console.log(err);
            alert("Failed to create todo card. Try again !");
        })
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
            
            removeTodo({todoId, listCode: this.props.listCode});
        })
        .catch((err) => {
            console.log(err);
            alert("Failed to delete todo card. Try again !");
        })

    }

    updateList(updateDetails)
    {
        /*Adds or deletes cards from the list */

        const newState = {todos:[]}; //The new state of the component

        if(updateDetails.addNew)
        {
            //Adds new todo to list

            this.state.todos.forEach((todo) => {
                newState.todos.push(todo);
            });
            newState.todos.push(updateDetails.newTodo);
        }
        else
        {
            //Removes todo from list
            this.state.todos.forEach((todo) => {
                if(!todo.id === updateDetails.deletedTodoId)
                    newState.todos.push(todo);
            })
        }

        //Updating the state
        this.setState(newState);
    }

    showNewTodoDialog = () => displayPopup(<NewTodoDialog createNewTodo={this.addNewTodo.bind(this)}/>);
}

/*****************************Exports************************* */
export default TodoList;
