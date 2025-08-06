import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import api from './axiosConfig';

const CATEGORY_OPTIONS = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Housing',
  'Education',
  'Travel',
  'Other'
];

function Budget() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '',
    category: '',
    source: '',
    date: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (budgets.length > 0) {
      fetchExpensesForCategories();
    }
    // eslint-disable-next-line
  }, [budgets]);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('budgets/');
      if (response.data.success) {
        setBudgets(response.data.budgets);
      }
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const fetchExpensesForCategories = async () => {
    const newExpenses = {};
    await Promise.all(
      budgets.map(async (budget) => {
        try {
          const response = await api.get(`category-expense-total/?category=${encodeURIComponent(budget.category)}`);
          if (response.data.success) {
            newExpenses[budget.category] = response.data.total;
          } else {
            newExpenses[budget.category] = '0';
          }
        } catch {
          newExpenses[budget.category] = '0';
        }
      })
    );
    setExpensesByCategory(newExpenses);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    if (!form.amount || !form.category || !form.source || !form.date) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      const response = await api.post('add-budget/', {
        amount: form.amount,
        category: form.category,
        source: form.source,
        date: form.date
      });
      if (response.data.success) {
        setMessage('Budget created successfully!');
        setForm({ amount: '', category: '', source: '', date: '' });
        fetchBudgets();
      } else {
        setError(response.data.message || 'Failed to create budget');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Navbar active="budget" />
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Budget</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button 
                  onClick={handleBack} 
                  className="btn btn-secondary"
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
            <h4 className="mb-4">Create a Budget</h4>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Enter budget amount"
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Source</label>
                <input
                  type="text"
                  className="form-control"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  required
                  placeholder="Enter source (e.g. Salary, Bonus)"
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Create Budget'}
              </button>
            </form>
          </div>
          {/* Show budgets below the form */}
          <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
            <h4 className="mb-4">Your Budgets</h4>
            {budgets.length === 0 ? (
              <div className="text-muted">No budgets found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Source</th>
                      <th>Date</th>
                      <th>Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map(budget => (
                      <tr key={budget.id}>
                        <td>${budget.amount}</td>
                        <td>{budget.category}</td>
                        <td>{budget.source}</td>
                        <td>{budget.date}</td>
                        <td>${expensesByCategory[budget.category] || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Budget;