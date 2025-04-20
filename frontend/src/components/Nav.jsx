import { useNavigate } from "react-router-dom";

const Nav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px",
      backgroundColor: "#e1eef3",
      height: "60px",
      borderBottom: "1px solid #ddd"
    }}>
      <h3 style={{ margin: 0 }}>Kanban Board</h3>
      <button 
        onClick={handleLogout}
        style={{
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.3s ease"
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#d32f2f"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#f44336"}
      >
        Logout
      </button>
    </nav>
  );
};

export default Nav;