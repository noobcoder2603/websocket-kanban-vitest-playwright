import { useRef } from "react";

const AddTask = ({ socket }) => {
  const todoRef = useRef(null);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (todoRef.current.value.trim() === "") return;
    
    socket.emit("createTask", {
      task: todoRef.current.value
    });
    todoRef.current.value = "";
  };

  return (
    <form className="form__input" onSubmit={handleAddTodo}>
      <label htmlFor="task">Add Todo</label>
      <input
        type="text"
        name="task"
        id="task"
        className="input"
        ref={todoRef}
        required
      />
      <button className="addTodoBtn">ADD TODO</button>
    </form>
  );
};

export default AddTask;