import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [state, setState] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:3010/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message);
      console.log(result.message);
      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userId);
      navigate('/Home'); 
      setState({
        username: '',
        password: ''
      })
    } else {
      alert(result.message);
      console.log(result.message);
      setState({
        username: '',
        password: ''
      })
    }
  };

  return (
    <div className="login-page">
      <div className="loginForm">
        <form className="login-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={state.username} name="username" onChange={(event) => setState({ ...state, username: event.target.value })} />
          <input type="password" placeholder="Password" value={state.password} name="password" onChange={(event) => setState({ ...state, password: event.target.value })} />
          <input type="submit" className="button" value="Login" />
          <p className="message">New Customer? <Link to="/Registration">Register Here</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
