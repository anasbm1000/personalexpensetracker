import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';
import Profile from './components/Profile';
import DetailsOfUsers from './admin/DetailsOfUsers';
import Customizedmsg from './components/Customizedmsg';
import './App.css';

const App = () => {
  
  return (
    <main>
      <Router>
        <Routes>
          <Route path='/' Component={Login} />
          <Route path='/Home'  Component={Home} />
          <Route path='/Registration' Component={Registration} />
          <Route path='/Profile' Component={Profile} />
          <Route path='/DetailsOfUsers' Component={DetailsOfUsers} /> 
          <Route path='/Customizedmsg' Component={Customizedmsg} />
        </Routes>
      </Router>
    </main>
    
  );
};

export default App;
