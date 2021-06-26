
/*****************************Imports************************* */

/*****************************Component**************************/
function TodoCard(props)
{
    return (
        <div className="todo-card">
            <h4 class="todo-card-title">{props.title}</h4>
            <p class="todo-card-dscr">{props.todoDescription}</p>
            <div className="todo-card-actions">
                
            </div>        
        </div>
    );
}

/*****************************Exports************************* */
export default TodoCard;