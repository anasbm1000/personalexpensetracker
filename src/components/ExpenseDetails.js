import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
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
  const [alertMessage, setAlertMessage] = useState('');
  const [chartData, setChartData] = useState([]);
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

  // Fetch Expenses
  const fetchExpenses = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/expenses/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setExpenses(data || []);  // Add default empty array to avoid undefined
      calculateTotalExpenses(data || []);  // Pass default empty array if data is undefined
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  }, [calculateTotalExpenses]);

  // Fetch Income and Categories
  const fetchIncomeAndCategories = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/categorylimits/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIncome(data.categoryLimits.income);
        setCategories(data.categoryLimits.budgetCategories.map(cat => cat.categoryName));
      }
    } catch (error) {
      console.error('Error fetching income and categories', error);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    fetchExpenses(userId);
    fetchIncomeAndCategories(userId);
  }, [navigate, fetchExpenses, fetchIncomeAndCategories]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (editMode && expenseToEdit) {
      handleUpdateExpense(expenseToEdit._id); // If in edit mode, update the expense
      return;
    }

    try {
      const newExpense = {
        userId,
        name: expenseName,
        amount: expenseAmount,
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
      }
      fetchExpenses(userId);
      resetForm();
    } catch (error) {
      console.error('Error adding expense', error);
    }
  };

  const handleUpdateExpense = async (expenseId) => {
    const userId = localStorage.getItem('userId');
    try {
      const updatedExpense = {
        userId,
        name: expenseName,
        amount: expenseAmount,
        category,
        date: new Date(),
      };
      const token = localStorage.getItem('token');
      await fetch(`/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExpense),
      });
      fetchExpenses(userId);
      resetForm();
    } catch (error) {
      console.error('Error updating expense', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const userId = localStorage.getItem('userId');

    const token = localStorage.getItem('token');
    
    try {
      await fetch(`/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      fetchExpenses(userId);
    } catch (error) {
      console.error('Error deleting expense', error);
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

  const generateChartData = useCallback((expenses) => {
    return (categories || []).map((cat) => {
      const totalForCategory = expenses
        .filter((expense) => expense.category === cat)
        .reduce((acc, curr) => acc + curr.amount, 0);
      return { category: cat, total: totalForCategory };
    });
  }, [categories]);

  useEffect(() => {
    setChartData(generateChartData(expenses));
  }, [expenses, generateChartData]);

  
  return (
    <div>
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
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select Category</option>
            {(categories || []).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{editMode ? 'Update Expense' : 'Add Expense'}</button>
      </form>

      <h2>Total Expenses: {totalExpenses}</h2>
      <h2>Balance: {balance}</h2>
      {alertMessage && <p style={{ color: 'red' }}>{alertMessage}</p>}

      <table>
        <thead>
          <tr>
            <th>Expense Name</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(expenses || []).map((expense, index) => (
            <tr key={index}>
              <td>{expense.name}</td>
              <td>{expense.category}</td>
              <td>{expense.amount}</td>
              <td>
                <button onClick={() => handleEditExpense(expense)}>Edit</button>
                <button onClick={() => handleDeleteExpense(expense._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Expense Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseDetails;
