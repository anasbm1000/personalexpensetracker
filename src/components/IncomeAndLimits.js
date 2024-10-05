import React, { useState, useEffect } from 'react';
import Customizedmsg from './Customizedmsg';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const IncomeAndLimits = () => {
    const [state, setState] = useState({
        income: 0,
        budgetCategories: [],
    });
    const [isEditing, setIsEditing] = useState(true); // Start in edit mode for first-time users
    const [isNewUser, setIsNewUser] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/');
            return;
        }

        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetch user profile (authentication check)
                const response = await fetch(`/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!data.success) navigate("/");
            } catch (error) {
                console.error("Error fetching user profile", error);
            }
        };

        const fetchCategoryLimits = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`/categorylimits/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 404) {
                    // No data exists for this user yet
                    setIsNewUser(true);
                    setIsEditing(true); // Enable edit mode for first-time input
                    return;
                }

                const data = await response.json();
                if (data.success && data.categoryLimits) {
                    setState({
                        income: data.categoryLimits.income,
                        budgetCategories: data.categoryLimits.budgetCategories,
                    });
                    setIsEditing(false); 
                    setIsNewUser(false);
                }
            } catch (error) {
                console.error("Error fetching category limits", error);
            }
        };

        fetchUserProfile();
        fetchCategoryLimits();
    }, [navigate]);

    const handleLimitChange = (e, index) => {
        const newLimit = Number(e.target.value);
        if (newLimit < 0 || newLimit > 100) {
            setModalMessage('Limit must be between 0 and 100%');
            setShowModal(true);
            return;
        }

        const updatedCategories = [...state.budgetCategories];
        updatedCategories[index].limitPercentage = newLimit;
        updatedCategories[index].amount = (state.income * newLimit) / 100;
        setState({ ...state, budgetCategories: updatedCategories });
    };

    const addCategory = () => {
        setState((prevState) => ({
            ...prevState,
            budgetCategories: [...prevState.budgetCategories, { categoryName: '', limitPercentage: 0, amount: 0 }]
        }));
    };

    const removeCategory = (index) => {
        const updatedCategories = [...state.budgetCategories];
        updatedCategories.splice(index, 1);
        setState({ ...state, budgetCategories: updatedCategories });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const totalLimit = state.budgetCategories.reduce((acc, curr) => acc + curr.limitPercentage, 0);

        if (totalLimit > 100) {
            setModalMessage('Total limit cannot exceed 100%');
            setShowModal(true);
            return;
        }

        const categoryLimitsData = {
            userId,
            income: state.income,
            budgetCategories: state.budgetCategories.map((category) => ({
                categoryName: category.categoryName,
                limitPercentage: category.limitPercentage,
                amount: category.amount
            })),
        };

        try {
            const response = await fetch(isNewUser ? '/categorylimits' : `/categorylimits/${userId}`, {
                method: isNewUser ? 'POST' : 'PUT', // POST for new entries, PUT for updates
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(categoryLimitsData),
            });

            const data = await response.json();
            if (data.success) {
                navigate('/IncomeProfile');
            } else {
                console.error("Error creating/updating category limits: " + data.message);
            }
        } catch (error) {
            console.error('Error creating/updating category limits:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    const calculateAmount = (limitPercentage) => {
        return (state.income * limitPercentage) / 100;
    };

    return (
        <div>
            <Customizedmsg show={showModal} handleClose={handleCloseModal} message={modalMessage} />
            <div className="userhome-page">
                <Link to="/" onClick={() => {
                    localStorage.removeItem("userId");
                    localStorage.removeItem("token");
                    navigate("/");
                }}>Logout</Link>
                <Link to="/Home">Back to Home</Link>
                <Link to="/IncomeProfile">Income Profile</Link>
            </div>
            <h1>{isEditing ? 'Set Income and Category Limits' : 'View/Edit Income and Category Limits'}</h1>

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <label>Income:</label>
                    <input
                        type="number"
                        value={state.income}
                        onChange={(e) => setState({ ...state, income: Number(e.target.value) })}
                        required
                    />

                    <div>
                        <h3>Budget Categories:</h3>
                        {state.budgetCategories.map((category, index) => (
                            <div key={index}>
                                <label>Category Name:</label>
                                <input
                                    type="text"
                                    value={category.categoryName}
                                    onChange={(e) => {
                                        const updatedCategories = [...state.budgetCategories];
                                        updatedCategories[index].categoryName = e.target.value;
                                        setState({ ...state, budgetCategories: updatedCategories });
                                    }}
                                    required
                                />

                                <label>Limit Percentage:</label>
                                <input
                                    type="number"
                                    value={category.limitPercentage}
                                    onChange={(e) => handleLimitChange(e, index)}
                                    required
                                />

                                <label>Amount:</label>
                                <input type="number" value={category.amount} disabled />

                                <button type="button" onClick={() => removeCategory(index)}>Remove</button>
                            </div>
                        ))}

                        <button type="button" onClick={addCategory}>Add Category</button>
                    </div>

                    <button type="submit">{isEditing ? 'Submit' : 'Save'}</button>
                </form>
            ) : (
                <div>
                    <h3>Income: ₹{state.income}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Limit (%)</th>
                                <th>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.budgetCategories.map((category, index) => (
                                <tr key={index}>
                                    <td>{category.categoryName}</td>
                                    <td>{category.limitPercentage}%</td>
                                    <td>₹{calculateAmount(category.limitPercentage)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                </div>
            )}
        </div>
    );
};

export default IncomeAndLimits;
