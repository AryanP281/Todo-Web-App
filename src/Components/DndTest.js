
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'

function DndTest()
{
    

    
    return (
        <div className="dnd-test">
            <DragDropContext>
                <Droppable droppableId="items">
                        {
                            (provided) => (
                                <ul className="items" {...provided.droppableProps} ref={provided.innerRef} style={{width: "100px", height: "100px", backgroundColor: "red"}}>
                                    <Draggable key={0} draggableId={0} index={0}>
                                        {
                                            (provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{padding: "10px"}}>Item 1</li>
                                            )
                                        }
                                    </Draggable>

                                    <Draggable key={0} draggableId={0} index={0}>
                                        {
                                            (provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{padding: "10px"}}>Item 2</li>
                                            )
                                        }
                                    </Draggable>
                                    
                                </ul>
                            )
                        }
                </Droppable>
            </DragDropContext>
        </div>
    )
}

export default DndTest;