import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AddTask from "./AddTask";
import TasksContainer from "./TasksContainer";
import Nav from "./Nav";

const Task = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const initialTasks = JSON.parse(localStorage.getItem("tasks"));
    setTasks(initialTasks);

    const newSocket = io("http://localhost:5002", {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on("tasks", (data) => {
      setTasks(data);
      localStorage.setItem("tasks", JSON.stringify(data));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!tasks) return <div>Loading tasks...</div>;

  return (
    <div>
      <Nav />
      <AddTask socket={socket} />
      <TasksContainer socket={socket} tasks={tasks} />
    </div>
  );
};

export default Task;