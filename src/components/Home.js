import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Customizedmsg from './Customizedmsg' 
import '../App.css';

const Home = () => {
  const [role, setRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [complaint, setComplaint] = useState({
    nameOfUser: '',
    emailOfUser: '',
    dateOfSubmission: new Date().toISOString().slice(0, 10),
    submissionType: '',
    description: '',
  });
  const [complaints, setComplaints] = useState([]);  
  const [showComplaints, setShowComplaints] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaint({ ...complaint, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId'); 
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      console.error('No user ID or token found in local storage');
      navigate('/');
      return;
    }

    try {
      const response = await fetch('/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...complaint, userId }), 
      });

      const data = await response.json();

      if (data.success) {
        setModalMessage(data.message);
        setShowModal(true);
        alert('Complaint/Suggestion submitted successfully');
        setComplaint({ nameOfUser: '', emailOfUser: '', dateOfSubmission: new Date().toISOString().slice(0, 10), submissionType: '', description: '' });
      } else {
        alert('Failed to submit complaint');
        setModalMessage(data.message);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  };

  const fetchComplaints = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/complaints/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints);
        setShowComplaints(true);  // Show complaints after fetching
      } else {
        console.error('Error fetching complaints:', data.message);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId"); 

    if (!userId) {
      console.error("No userId found in localStorage");
      navigate('/');
      return;
    }
      
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await fetch(`/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }, 
        });
        const data = await response.json();
        
        if (data.success) {
            setRole(data.user.role);
        } else {
            console.error("Error fetching user data:", data.message);
        }
      } catch (error) {
          console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
        fetchUserData();
    } else {
        console.error("No userId found in localStorage");
    }
  }, [navigate]);

  const handleCloseModal = () => {
    setShowModal(false);
  };
   
  return (
    <div className="home-container">
      {showModal && <Customizedmsg show={showModal} handleClose={handleCloseModal} message={modalMessage} />}
      <div className="userhome-page">
        <Link to="/" onClick={() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            navigate("/"); 
        }}>Logout</Link>
      </div>
      <div className="home">
        { role === 'user' && <h2>Welcome to <span id="expense"> Expense </span> Tracker</h2>}
        <div className="card-container">
          <div className="card">
            <Link to="/Profile">Profile Details</Link>
          </div>
          { role === 'admin' && <div className="card">
            <Link to="/DetailsOfUsers">Registered Users</Link>
          </div> }
          { role === 'user' && <div className="card">
            <Link to="/IncomeAndLimits">Budget Details</Link>
          </div> }
          { role === 'user' && <div className="card">
            <Link to="/ExpenseDetails">Expense Details</Link>
          </div> }
          { role === 'admin' && <div className="card">
            <Link to="/ViewCNS">View Suggestions</Link>
          </div> }
        </div>
      </div>

      { role === 'user' && <div className="tips-section">
        <h2>Expense Management Tips</h2>
        <ul>
          <li>Create a monthly budget and stick to it.</li>
          <li>Track your spending to identify unnecessary expenses.</li>
          <li>Set aside savings before spending on non-essential items.</li>
          <li>Limit the use of credit cards to avoid debt.</li>
          <li>Take advantage of discounts, sales, and coupons.</li>
        </ul>
        <h3>Useful Resources</h3>
        <ul>
          <li><a href="https://youtu.be/HQzoZfc3GwQ?si=q90lyg-oC-lR4LZj" target="_blank" rel="noopener noreferrer">How to Budget Your Money Effectively</a></li>
          <li><a href="https://youtu.be/x6S63406raY?si=YtU4VfYJQa1Md7FA" target="_blank" rel="noopener noreferrer">5 Tips for Saving Money</a></li>
          <li><a href="https://youtu.be/v6bx9g-mqyo?si=C8-Pbg2EPQ_wTAJx" target="_blank" rel="noopener noreferrer">Expense Management Strategies</a></li>
        </ul>
      </div>}

      { role === 'user' && <div className="awareness-section">
        <h2>Financial Awareness</h2>
        <p>
          Managing your income wisely is crucial for financial stability and growth. It's important to be aware of your spending habits and make conscious decisions to save and invest your money. Here are a few key points to keep in mind:
        </p>
        <ul>
          <li>Always keep an emergency fund for unexpected expenses.</li>
          <li>Invest in insurance to protect against financial risks.</li>
          <li>Educate yourself about personal finance and investment options.</li>
          <li>Review your financial goals regularly and adjust your budget accordingly.</li>
        </ul>
        <h3>Learn More</h3>
        <ul>
          <li><a href="https://www.jmu.edu/first-gen/valleyscholars/_files/personal-finance-guide.pdf" target="_blank" rel="noopener noreferrer">Understanding Personal Finance</a></li>
          <li><a href="https://www.cmu.edu/sfs/access/docs/9-tips.pdf" target="_blank" rel="noopener noreferrer">How to Manage Your Money</a></li>
        </ul>
      </div>}
      { role === 'user' && 
        <>
          <button onClick={fetchComplaints}>View Registered Complaints</button>
          {showComplaints && (
            <div className="complaints-list">
              <h3>Registered Complaints/Suggestions</h3>
              <ul>
                {complaints.map((complaint, index) => (
                  <li key={index}>
                    <p><strong>{complaint.nameOfUser}</strong> ({complaint.emailOfUser})</p>
                    <p>Date: {new Date(complaint.dateOfSubmission).toLocaleDateString()}</p>
                    <p>Type: {complaint.submissionType} </p>
                    <p>Description: {complaint.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      }
      { role === 'user' && <form onSubmit={handleSubmit}>
        <h3>Complaint/Suggestion Form</h3>
        <input 
          type="text" 
          name="nameOfUser" 
          value={complaint.nameOfUser} 
          onChange={handleInputChange} 
          placeholder="Name" 
          required 
        />
        <input 
          type="email" 
          name="emailOfUser" 
          value={complaint.emailOfUser} 
          onChange={handleInputChange} 
          placeholder="Email" 
          required 
        />
        <input 
          type="date" 
          name="dateOfSubmission" 
          value={complaint.dateOfSubmission} 
          onChange={handleInputChange} 
          required 
        />
        <div>
            <input
              type="radio"
              name="submissionType"
              value="Complaint"
              style={{ color: 'black', display: 'inline', width: '20px' }}
              checked={complaint.submissionType === 'Complaint'}
              onChange={handleInputChange}
              required
            /><span style={{ color: 'black', display: 'inline', width: '20px' }}>Complaint</span>
            <input
              type="radio"
              name="submissionType"
              value="Suggestion"
              style={{ color: 'black', display: 'inline', width: '20px' }}
              checked={complaint.submissionType === 'Suggestion'}
              onChange={handleInputChange}
            />
            <span style={{ color: 'black', display: 'inline', width: '20px' }}>Suggestion</span>
          </div>
        <textarea 
          name="description" 
          value={complaint.description} 
          onChange={handleInputChange} 
          placeholder="Enter your complaint/suggestion" 
          required 
        />
        <button type="submit">Submit</button>
      </form> }     
    </div>
    
  );
};
export default Home;
