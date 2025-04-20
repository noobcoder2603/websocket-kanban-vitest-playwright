import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link } from "react-router-dom";

const TasksContainer = ({ socket, tasks }) => {
  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    socket.emit("moveTask", {
      token: localStorage.getItem("token"),
      source: {
        columnId: source.droppableId,
        index: source.index
      },
      destination: {
        columnId: destination.droppableId,
        index: destination.index
      }
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container">
        {Object.entries(tasks).map(([columnId, column]) => (
          <div key={columnId} className={`${columnId}__wrapper`}>
            <h3>{columnId.charAt(0).toUpperCase() + columnId.slice(1)} Tasks</h3>
            <div className={`${columnId}__container`}>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${columnId}__items`}
                          >
                            <p>{task.title}</p>
                            <p className="comment">
                              <Link to={`/comments/${columnId}/${task.id}`}>
                                {task.comments?.length > 0 ? "View Comments" : "Add Comment"}
                              </Link>
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TasksContainer;