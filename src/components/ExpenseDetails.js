import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';

const ExpenseDetails = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const navigate = useNavigate();

  const calculateTotalExpenses = useCallback((expensesList) => {
    const total = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
    setTotalExpenses(total);
    setBalance(income - total);

    const expensePercentage = (total / income) * 100;
    if (expensePercentage > 90) {
      setAlertMessage('Alert: You have used more than 90% of your income!');
    } else if (expensePercentage > 75) {
      setAlertMessage('Warning: You have used more than 75% of your income!');
    } else if (expensePercentage > 50) {
      setAlertMessage('Note: You have used more than 50% of your income.');
    } else {
      setAlertMessage('');
    }
  }, [income]);

  const fetchExpenses = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/expenses/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setExpenses(data || []);
      calculateTotalExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  }, [calculateTotalExpenses]);

  const fetchIncomeAndCategories = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/categorylimits/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setIncome(data.categoryLimits.income);
        setCategories(data.categoryLimits.budgetCategories);
      }
    } catch (error) {
      console.error('Error fetching income and categories', error);
    }
  }, []);

  const calculateCategoryTotals = useCallback(() => {
    const totals = categories.map((category) => {
      const totalAmount = expenses
        .filter((expense) => expense.category === category.categoryName)
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        category : category.categoryName,
        totalAmount,
        details: expenses.filter((expense) => expense.category === category.categoryName),
      };
    });
    setCategoryTotals(totals);
  }, [categories, expenses]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    fetchExpenses(userId);
    fetchIncomeAndCategories(userId);
  }, [navigate, fetchExpenses, fetchIncomeAndCategories]);

  useEffect(() => {
    if (categories.length > 0 && expenses.length > 0) {
      calculateCategoryTotals();
    }
  }, [categories, expenses, calculateCategoryTotals]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
  
    // Fetch the current category limit
    const selectedCategory = categories.find((cat) => cat.categoryName === category);
    const categoryLimit = selectedCategory ? selectedCategory.amount : 0;
    const currentCategoryTotal = categoryTotals.find((total) => total.category === category)?.totalAmount || 0;
  
    const newExpenseAmount = Number(expenseAmount);
    const newTotalExpenseForCategory = currentCategoryTotal + newExpenseAmount;
  
    if (editMode && expenseToEdit) {
      handleUpdateExpense(expenseToEdit._id);
      return;
    }
  
    // Check if the new expense exceeds the category limit
    if (newTotalExpenseForCategory > categoryLimit) {
      const proceed = window.confirm(
        `The total expenses for category "${category}" exceed the limit (${categoryLimit}). Do you still want to add this expense?`
      );
      if (!proceed) {
        return;
      }
    }
  
    // Check if the new total expenses exceed the user's income
    const newTotalExpenses = totalExpenses + newExpenseAmount;
    if (newTotalExpenses > income) {
      alert(`Adding this expense will exceed your total income limit. Please adjust the expense.`);
      return;
    }
  
    // Proceed with adding the expense
    try {
      const newExpense = {
        userId,
        name: expenseName,
        amount: newExpenseAmount,
        category,
        date: new Date(),
      };
  
      const token = localStorage.getItem('token');
      const response = await fetch('/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });
  
      const data = await response.json();
      if (data.success) {
        setExpenses([...expenses, newExpense]);
        calculateTotalExpenses([...expenses, newExpense]);
        alert('Expense added successfully!');
      } else {
        alert('Error adding expense: ' + data.message); // Error alert
      }
      fetchExpenses(userId);
      resetForm();
    } catch (error) {
      console.error('Error adding expense', error);
      alert('There was a problem adding the expense. Please try again.');
    }
  };
  

  const handleUpdateExpense = async (expenseId) => {
    const userId = localStorage.getItem('userId');

    // Get the current category and expense amounts before the update
    const originalExpense = expenses.find((exp) => exp._id === expenseId);
    const originalAmount = originalExpense ? originalExpense.amount : 0;
    
    const selectedCategory = categories.find((cat) => cat.categoryName === category);
    const categoryLimit = selectedCategory ? selectedCategory.amount : 0;

    const currentCategoryTotal = categoryTotals.find((total) => total.category === category)?.totalAmount || 0;
    
    const newExpenseAmount = Number(expenseAmount);
    const newTotalExpenseForCategory = (currentCategoryTotal - originalAmount) + newExpenseAmount;
  
    // Check if the updated expense exceeds the category limit
    if (newTotalExpenseForCategory > categoryLimit) {
      const proceed = window.confirm(
        `The total expenses for category "${category}" exceed the limit (${categoryLimit}). Do you still want to update this expense?`
      );
      if (!proceed) {
        return;
      }
    }
  
    // Check if the updated total expenses exceed the user's income
    const newTotalExpenses = (totalExpenses - originalAmount) + newExpenseAmount;
    if (newTotalExpenses > income) {
      alert(`Updating this expense will exceed your total income limit. Please adjust the expense.`);
      return;
    }
  
    try {
      const updatedExpense = {
        userId,
        name: expenseName,
        amount: newExpenseAmount,
        category,
        date: new Date(),
      };

      const confirmUpdate = window.confirm('Are you sure you want to update this expense?');
      if (!confirmUpdate) return;      

      const token = localStorage.getItem('token');
      await fetch(`/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExpense),
      });
      fetchExpenses(userId);
      resetForm();
      alert('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense', error);
      alert('There was a problem updating the expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const confirmDelete = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmDelete) return;

    try {
      await fetch(`/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          Authorization : `Bearer ${token}`,
        },
      });
      fetchExpenses(userId);
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense', error);
      alert('There was a problem deleting the expense. Please try again.');
    }
  };

  const handleEditExpense = (expense) => {
    setEditMode(true);
    setExpenseToEdit(expense);
    setExpenseName(expense.name);
    setExpenseAmount(expense.amount);
    setCategory(expense.category);
  };

  const resetForm = () => {
    setExpenseName('');
    setExpenseAmount(0);
    setCategory('');
    setEditMode(false);
    setExpenseToEdit(null);
  };

  // Memoize color generation to keep consistent colors across renders

const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const currentCategory = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`Category: ${label}`}</p>
          <p>{`Total amount: ${currentCategory.totalAmount}`}</p>
          
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="userhome-page">
          <Link to="/" onClick={() => {
              localStorage.removeItem("userId");
              localStorage.removeItem("token");
              navigate("/");
          }}>Logout</Link>
          <Link to="/Home">Back to Home</Link>
      </div>
      <h1>Expense Details</h1>

      <form onSubmit={handleAddExpense}>
        <div>
          <label>Expense Name:</label>
          <input
            type="text"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categoryName}>
                {category.categoryName} (Limit: {category.amount})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{editMode ? 'Update Expense' : 'Add Expense'}</button>
      </form>

      <h2>Total Expenses: {totalExpenses}</h2>
      <h2>Balance: {balance}</h2>
      {alertMessage && <p style={{ color: 'red' }}>{alertMessage}</p>}

      <h3>Category Totals:</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={categoryTotals}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip content={customTooltip} />
          <Legend />
          <Bar dataKey="totalAmount" fill="#82ca9d" />     
        </BarChart>
      </ResponsiveContainer>

      <h3>Expense List:</h3>
      <table>
        <thead>
          <tr>
            <th>Expense Name</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(expenses || []).map((expense, index) => (
            <tr key={index}>
              <td>{expense.name}</td>
              <td>{expense.category}</td>
              <td>{expense.amount}</td>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEditExpense(expense)}>Edit</button>
                <button onClick={() => handleDeleteExpense(expense._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
};

export default ExpenseDetails;
