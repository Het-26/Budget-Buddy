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
  const [editBudget, setEditBudget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

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

  const handleEditClick = (budget) => {
    setEditBudget({ ...budget });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditBudget((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      const response = await api.put(`budgets/${editBudget.id}/`, {
        amount: editBudget.amount,
        category: editBudget.category,
        source: editBudget.source,
        date: editBudget.date
      });
      if (response.data.success) {
        setShowEditModal(false);
        fetchBudgets();
      } else {
        setEditError(response.data.message || 'Failed to update budget');
      }
    } catch (err) {
      setEditError('Network error. Please try again.');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    setDeleteError('');
    try {
      const response = await api.delete(`budgets/${deleteId}/`);
      if (response.data.success) {
        setDeleteId(null);
        fetchBudgets();
      } else {
        setDeleteError(response.data.message || 'Failed to delete budget');
      }
    } catch (err) {
      setDeleteError('Network error. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
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
                      <th>Actions</th>
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
                        <td>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(budget)}>
                            <i className="bi bi-pencil-square"></i> Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(budget.id)}>
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Edit Modal */}
            {showEditModal && editBudget && (
              <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={handleEditSave}>
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Budget</h5>
                        <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        {editError && <div className="alert alert-danger">{editError}</div>}
                        <div className="mb-3">
                          <label className="form-label">Amount</label>
                          <input type="number" className="form-control" name="amount" value={editBudget.amount} onChange={handleEditChange} min="0" step="0.01" required />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <select className="form-select" name="category" value={editBudget.category} onChange={handleEditChange} required>
                            <option value="">Select a category</option>
                            {CATEGORY_OPTIONS.map((cat, idx) => (
                              <option key={idx} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Source</label>
                          <input type="text" className="form-control" name="source" value={editBudget.source} onChange={handleEditChange} required />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Date</label>
                          <input type="date" className="form-control" name="date" value={editBudget.date} onChange={handleEditChange} required />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteId && (
              <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Delete</h5>
                      <button type="button" className="btn-close" onClick={handleDeleteCancel}></button>
                    </div>
                    <div className="modal-body">
                      {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                      <p>Are you sure you want to delete this budget?</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleDeleteCancel}>Cancel</button>
                      <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Budget;