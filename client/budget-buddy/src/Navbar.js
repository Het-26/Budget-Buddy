import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ active }) {
  const navigate = useNavigate();
  return (
    <nav className="col-md-3 col-lg-2 d-md-block bg-primary sidebar collapse" style={{ minHeight: '100vh' }}>
      <div className="position-sticky pt-3">
        <div className="text-center mb-4">
          <h2 className="text-white">Budget Buddy</h2>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button className={`btn btn-light w-100 text-start${active === 'dashboard' ? ' active' : ''}`} onClick={() => navigate('/home')}>
              <i className="bi bi-house-door me-2"></i>
              Dashboard
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn btn-light w-100 text-start${active === 'add-expense' ? ' active' : ''}`} onClick={() => navigate('/add-expense')}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Expense
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn btn-light w-100 text-start${active === 'expense-history' ? ' active' : ''}`} onClick={() => navigate('/expense-history')}>
              <i className="bi bi-clock-history me-2"></i>
              Expense History
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn btn-light w-100 text-start${active === 'budget' ? ' active' : ''}`} onClick={() => navigate('/budget')}>
              <i className="bi bi-pie-chart me-2"></i>
              Budget
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;