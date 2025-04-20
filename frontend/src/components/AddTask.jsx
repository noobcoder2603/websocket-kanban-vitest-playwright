import { useRef } from "react";

const AddTask = ({ socket }) => {
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const task = inputRef.current.value.trim();
    if (task && socket) {
      socket.emit("addTask", {
        token: localStorage.getItem("token"),
        task
      });
      inputRef.current.value = "";
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        margin: "16px 0",
        padding: "0 16px",
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <div style={{
        display: "flex",
        gap: "8px",
        alignItems: "center"
      }}>
        <input
          type="text"
          id="task"
          ref={inputRef}
          placeholder="Enter task title..."
          required
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            fontSize: "14px",
            minWidth: "240px",
            outline: "none",
            transition: "border-color 0.3s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
          onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
          onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
        />
        <button 
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.3s ease",
            width: "80px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#45a049";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#4CAF50";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
          }}
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default AddTask;