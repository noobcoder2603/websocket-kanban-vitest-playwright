import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5002/api/login", {
        email: emailRef.current.value,
        password: passwordRef.current.value
      });
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("tasks", JSON.stringify(response.data.tasks));
      navigate("/tasks");
    } catch (err) {
      setError("Invalid credentials");
    }
  };


  return (
    <div className="login-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div className="login-card" style={{
        width: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#333'
        }}>Welcome back!</h2>
        
        <p style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#666'
        }}>Sign in to access your account</p>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>Email</label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>Password</label>
            <input
              type="password"
              id="password"
              ref={passwordRef}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button type="submit" style={{
            backgroundColor: '#000',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            Sign In
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: '#666'
        }}>
          Don't have an account?{' '}
          <button 
            onClick={() => navigate('/Signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;