import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';
// import Userhome from './components/Userhome';
// import Userprofile from './components/Userprofile';
// import DetailsOfUsers from './components/DetailsOfUsers';
import './App.css';

const App = () => {
  
  return (
    <Router>
      <Routes>
        <Route path='/' Component={Login} />
        <Route path='/Home'  Component={Home} />
        <Route path='/Registration' Component={Registration} />
        {/* <Route path='/Userhome' Component={Userhome} />
        <Route path='/Userprofile' Component={Userprofile} />
        <Route path='/DetailsOfUsers' Component={DetailsOfUsers} /> */}
      </Routes>
    </Router>
  );
};

export default App;
