import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Customizedmsg from './Customizedmsg';
import '../App.css';

const Login = () => {
  const [state, setState] = useState({
    username: '',
    password: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate();  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    const result = await response.json();

    if (result.success) {
      setModalMessage(result.message);
      setShowModal(true);
      console.log(result.message);
      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userId);
      navigate('/Home'); 
      setState({
        username: '',
        password: ''
      })
    } else {
      setModalMessage(result.message);
      setShowModal(true);
      console.log(result.message);
      setState({
        username: '',
        password: ''
      })
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    
    <div className="login-page">

      
      
      <div className="loginForm">
        <form className="login-form" onSubmit={handleSubmit}>
         {showModal && <Customizedmsg show={showModal} handleClose={handleCloseModal} message={modalMessage} />}
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
