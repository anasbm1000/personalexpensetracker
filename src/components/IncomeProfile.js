import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const IncomeProfile = () => {
    const [income, setIncome] = useState(0);
    const [budgetCategories, setBudgetCategories] = useState([]);
    const [editing, setEditing] = useState(false); // New state for edit mode
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            console.error('No userId found in localStorage');
            navigate('/');
            return;
        }

        const fetchCategoryLimits = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate("/");
                return;
            }
            try {
                const response = await fetch(`/categorylimits/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setIncome(data.categoryLimits.income);
                    // Set budget categories as an array of objects
                    setBudgetCategories(data.categoryLimits.budgetCategories);
                }
            } catch (error) {
                console.error('Error fetching category limits:', error);
            }
        };
        fetchCategoryLimits();
    }, [navigate]);

    const calculateAmount = (limitPercentage) => {
        return (income * limitPercentage) / 100;
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        const updatedCategoryLimits = {
            income: income,
            budgetCategories: budgetCategories
        };

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`/categorylimits/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedCategoryLimits),
            });

            const data = await response.json();
            if (data.success) {
                setIncome(updatedCategoryLimits.income);
                setBudgetCategories(updatedCategoryLimits.budgetCategories);
                setEditing(false); // Exit edit mode after successful update
            } else {
                console.log("Error updating category limits: " + data.message);
            }
        } catch (error) {
            console.error('Error updating category limits:', error);
        }
    };

    const handleInputChange = (index, value) => {
        const updatedCategories = [...budgetCategories];
        updatedCategories[index].limitPercentage = value;
        setBudgetCategories(updatedCategories);
    };

    return (
        <div>
            <div className="userhome-page">
                <Link to="/">Logout</Link>
                <Link to="/Home">Back to Home</Link>
            </div>
            <div>
                <h3>Income: ₹{income}</h3>

                {editing ? (
                    <form onSubmit={handleUpdate}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Limit (%)</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetCategories.map((category, index) => (
                                    <tr key={index}>
                                        <td>{category.categoryName}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={category.limitPercentage}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                            />
                                        </td>
                                        <td>₹{calculateAmount(category.limitPercentage)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <label>
                            Income:
                            <input
                                type="number"
                                name="income"
                                defaultValue={income}
                                onChange={(e) => setIncome(e.target.value)}
                            />
                        </label>
                        <button type="submit">Save</button>
                    </form>
                ) : (
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Limit (%)</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetCategories.map((category, index) => (
                                    <tr key={index}>
                                        <td>{category.categoryName}</td>
                                        <td>{category.limitPercentage}%</td>
                                        <td>₹{calculateAmount(category.limitPercentage)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setEditing(true)}>Edit</button>
                    </div>
                )}
                <Link to="/IncomeAndLimits">Edit Limits</Link>
            </div>
        </div>
    );
};

export default IncomeProfile;
