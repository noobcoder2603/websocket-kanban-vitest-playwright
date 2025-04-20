import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Task from "./components/Task";
import Comments from "./components/Comments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      // In App.jsx
      <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/tasks" element={<Task />} />
        <Route path="/comments/:category/:id" element={<Comments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;