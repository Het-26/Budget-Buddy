import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function History() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editExpense, setEditExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch('http://localhost:8000/api/expenses/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setExpenses(data.expenses);
      } else {
        setError(data.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, [navigate]);

  // Edit handlers
  const handleEditClick = (expense) => {
    setEditExpense({ ...expense });
    setModalError('');
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/expenses/${editExpense.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: editExpense.amount,
          description: editExpense.description,
          category: editExpense.category,
          date: editExpense.date,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setModalMessage('Expense updated successfully!');
        setShowModal(false);
        fetchExpenses();
      } else {
        setModalError(data.message || 'Failed to update expense');
      }
    } catch (err) {
      setModalError('Network error. Please try again.');
    }
  };

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    setModalError('');
    setModalMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/expenses/${deletingId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setModalMessage('Expense deleted successfully!');
        setDeletingId(null);
        fetchExpenses();
      } else {
        setModalError(data.message || 'Failed to delete expense');
      }
    } catch (err) {
      setModalError('Network error. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeletingId(null);
  };

  // Filter logic
  const filteredExpenses = expenses.filter(exp => {
    const expDate = exp.date;
    if (filterFrom && expDate < filterFrom) return false;
    if (filterTo && expDate > filterTo) return false;
    return true;
  });

  const handleClearFilter = () => {
    setFilterFrom('');
    setFilterTo('');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar Navigation */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-primary sidebar collapse" style={{ minHeight: '100vh' }}>
          <div className="position-sticky pt-3">
            <div className="text-center mb-4">
              <h2 className="text-white">Budget Buddy</h2>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <button className="btn btn-light w-100 text-start" onClick={() => navigate('/add-expense')}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Expense
                </button>
              </li>
              <li className="nav-item mb-2">
                <button className="btn btn-light w-100 text-start active">
                  <i className="bi bi-clock-history me-2"></i>
                  Expense History
                </button>
              </li>
              <li className="nav-item mb-2">
                <button className="btn btn-light w-100 text-start" onClick={() => navigate('/budget')}>
                  <i className="bi bi-pie-chart me-2"></i>
                  Budget
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Expense History</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button onClick={() => navigate('/home')} className="btn btn-secondary">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Filter by date */}
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">From</label>
              <input type="date" className="form-control" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">To</label>
              <input type="date" className="form-control" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary me-2" onClick={handleClearFilter} disabled={!filterFrom && !filterTo}>Clear Filter</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">{error}</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="alert alert-info" role="alert">No expenses found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount ($)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>{exp.description}</td>
                      <td>{exp.category}</td>
                      <td>{exp.amount}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(exp)}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(exp.id)}>
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
          {showModal && editExpense && (
            <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <form onSubmit={handleEditSave}>
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Expense</h5>
                      <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      {modalError && <div className="alert alert-danger">{modalError}</div>}
                      <div className="mb-3">
                        <label className="form-label">Amount ($)</label>
                        <input type="number" className="form-control" name="amount" value={editExpense.amount} onChange={handleEditChange} step="0.01" min="0" required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <input type="text" className="form-control" name="description" value={editExpense.description} onChange={handleEditChange} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select className="form-select" name="category" value={editExpense.category} onChange={handleEditChange} required>
                          <option value="">Select a category</option>
                          <option value="Food & Dining">Food & Dining</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Housing">Housing</option>
                          <option value="Education">Education</option>
                          <option value="Travel">Travel</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-control" name="date" value={editExpense.date} onChange={handleEditChange} required />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingId && (
            <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button type="button" className="btn-close" onClick={handleDeleteCancel}></button>
                  </div>
                  <div className="modal-body">
                    {modalError && <div className="alert alert-danger">{modalError}</div>}
                    <p>Are you sure you want to delete this expense?</p>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleDeleteCancel}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {modalMessage && (
            <div className="alert alert-success mt-3" role="alert">{modalMessage}</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default History;