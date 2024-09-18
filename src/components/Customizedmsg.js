import React from 'react';
import '../App.css';

const Customizedmsg = ({ show, handleClose, message }) => {
  return (
    <div className={`modal ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <h2>Expense Tracker says</h2>
        <p>{message}</p>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default Customizedmsg;
