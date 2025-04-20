import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link } from "react-router-dom";

const TasksContainer = ({ socket, tasks: initialTasks }) => {
  const [tasks, setTasks] = useState(initialTasks);

  // Keep local state in sync with server
  useEffect(() => {
    socket.on("tasks", (updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => {
      socket.off("tasks");
    };
  }, [socket]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // If dropped outside the list or in same position
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    // Optimistically update local state first
    const newTasks = JSON.parse(JSON.stringify(tasks));
    const [removed] = newTasks[source.droppableId].items.splice(source.index, 1);
    newTasks[destination.droppableId].items.splice(destination.index, 0, removed);
    setTasks(newTasks);

    // Notify server of the change
    socket.emit("taskDragged", {
      source: {
        droppableId: source.droppableId,
        index: source.index
      },
      destination: {
        droppableId: destination.droppableId,
        index: destination.index
      }
    });
  };

  if (!tasks) return <div>Loading tasks...</div>;

  return (
    <div className="container">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(tasks).map(([status, category]) => (
          <div
            className={`${category.title.toLowerCase()}__wrapper`}
            key={category.title}
          >
            <h3>{category.title} Tasks</h3>
            <div className={`${category.title.toLowerCase()}__container`}>
              <Droppable droppableId={category.title}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {category.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${category.title.toLowerCase()}__items`}
                          >
                            <p>{item.title}</p>
                            <p className="comment">
                              <Link to={`/comments/${category.title}/${item.id}`}>
                                {item.comments.length > 0 ? "View Comments" : "Add Comment"}
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
      </DragDropContext>
    </div>
  );
};

export default TasksContainer;