import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';
import Profile from './components/Profile';
import DetailsOfUsers from './admin/DetailsOfUsers';
import IncomeAndLimits from './components/IncomeAndLimits';
import IncomeProfile from './components/IncomeProfile';
import ExpenseDetails from './components/ExpenseDetails';
import Customizedmsg from './components/Customizedmsg';
import ViewCNS from './admin/ViewCNS';
import './App.css';

const App = () => {


  return (
    <main>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/Home' element={<Home />} />
          <Route path='/Registration' element={<Registration />} />
          <Route path='/Profile' element={<Profile />} />
          <Route path='/DetailsOfUsers' element={<DetailsOfUsers />} />
          <Route path='/IncomeAndLimits' element={<IncomeAndLimits />} />
          <Route path='/IncomeProfile' element={<IncomeProfile />} />
          <Route path='/ExpenseDetails' element={<ExpenseDetails />} />
          <Route path='/Customizedmsg' element={<Customizedmsg />} />
          <Route path='/ViewCNS' element={<ViewCNS />} />
        </Routes>
      </Router>
    </main>
  );
};

export default App;
