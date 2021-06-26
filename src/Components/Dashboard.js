
/*****************************Imports*********************/
import { useState } from "react";
import NewListDialog from "./NewListDialog";
import SideNavBar from "./SideNavBar";
import TodoList from "./TodoList";

/*****************************Variables*********************/

/*****************************Component*********************/
function Dashboard(props)
{
    const [todoLists, setTodoLists] = useState(props.todos);
    
    return (
        <div className="dashboard">
            <SideNavBar />
            {getLists(todoLists)}
        </div>
    );
}

function getLists(listMap)
{
    const lists = []
    listMap.forEach((value,key) => {
        lists.push(<TodoList title={key} todos={value}/>)
    })

    return lists;
}

/*****************************Exports*********************/
export {Dashboard};