import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Home = () => {
  const [role, setRole] = useState(null);
    
    const navigate = useNavigate();

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
  return (
    <div className="home-container">
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
    </div>
  );
};
export default Home;
