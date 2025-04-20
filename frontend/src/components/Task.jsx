import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AddTask from "./AddTask";
import TasksContainer from "./TasksContainer";
import Nav from "./Nav";
import { useNavigate } from "react-router-dom";

const Task = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    console.log("Connecting to WebSocket...");
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected!");
      setConnectionError(null);
      newSocket.emit("getTasks", token);
    });

    newSocket.on("tasks", (data) => {
      console.log("Received tasks data:", data);
      setTasks(data);
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setConnectionError("Failed to connect to server. Retrying...");
      setTasks({ 
        pending: [], 
        ongoing: [], 
        completed: [] 
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      if (reason === "io server disconnect") {
        setConnectionError("Server disconnected. Please refresh the page.");
      }
    });

    setSocket(newSocket);

    const connectionTimeout = setTimeout(() => {
      if (!tasks && !connectionError) {
        setConnectionError("Connection is taking longer than expected...");
      }
    }, 5000);

    return () => {
      clearTimeout(connectionTimeout);
      newSocket.disconnect();
    };
  }, [navigate]);

  if (!tasks) {
    return (
      <div>
        <Nav />
        <div className="loading-container">
          <p>Loading kanban board...</p>
          {connectionError && <p className="error-message">{connectionError}</p>}
          <button 
            onClick={() => window.location.reload()} 
            className="refresh-button"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <Nav />
      <AddTask socket={socket} />
      <TasksContainer socket={socket} tasks={tasks} />
    </div>
  );
};

export default Task;