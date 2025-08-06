import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from './axiosConfig';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CATEGORY_LABELS = [
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

function Home() {
  const [username, setUsername] = useState('');
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [monthlyTotals, setMonthlyTotals] = useState(Array(12).fill(0));
  const [categoryTotals, setCategoryTotals] = useState(Array(CATEGORY_LABELS.length).fill(0));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token) {
      navigate('/');
      return;
    }
    setUsername(storedUsername);
    fetchExpenses(token);
    // eslint-disable-next-line
  }, [navigate]);

  const fetchExpenses = async (token) => {
    try {
      const response = await api.get('expenses/');
      if (response.data.success) {
        calculateTotals(response.data.expenses);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const calculateTotals = (expenses) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    let lastMonthSum = 0;
    let thisMonthSum = 0;
    let annualSum = 0;
    const monthly = Array(12).fill(0);
    const category = Array(CATEGORY_LABELS.length).fill(0);
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const catIdx = CATEGORY_LABELS.indexOf(exp.category);
      if (expDate.getFullYear() === thisYear && expDate.getMonth() === thisMonth) {
        thisMonthSum += parseFloat(exp.amount);
      } else if (expDate.getFullYear() === lastMonthYear && expDate.getMonth() === lastMonth) {
        lastMonthSum += parseFloat(exp.amount);
      }
      if (expDate.getFullYear() === thisYear) {
        annualSum += parseFloat(exp.amount);
        monthly[expDate.getMonth()] += parseFloat(exp.amount);
        if (catIdx !== -1) {
          category[catIdx] += parseFloat(exp.amount);
        }
      }
    });
    setThisMonthTotal(thisMonthSum);
    setLastMonthTotal(lastMonthSum);
    setAnnualTotal(annualSum);
    setMonthlyTotals(monthly);
    setCategoryTotals(category);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  // Chart.js data and options
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlyTotals,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `Monthly Expenses (${new Date().getFullYear()})` }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Pie chart for category totals
  const pieData = {
    labels: CATEGORY_LABELS,
    datasets: [
      {
        label: 'Expenses by Category',
        data: categoryTotals,
        backgroundColor: [
          '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#fd7e14',
          '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d'
        ],
        borderWidth: 1,
      }
    ]
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: `Expenses by Category (${new Date().getFullYear()})` }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Navbar active="dashboard" />
        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button 
                  onClick={handleLogout} 
                  className="btn btn-danger"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 1000, padding: 0, margin: '0 auto' }}>
            <div className="row g-4 justify-content-center mt-5">
              <div className="col-12 d-flex justify-content-center">
                <div className="row w-100 justify-content-center" style={{maxWidth: 900}}>
                  <div className="col-md-4 mb-3">
                    <div className="card shadow-sm border-0 text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title mb-2">Last Month's Expenses</h5>
                        <p className="card-text display-6 fw-bold text-secondary mb-0">${lastMonthTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card shadow-sm border-0 text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title mb-2">This Month's Expenses</h5>
                        <p className="card-text display-6 fw-bold text-primary mb-0">${thisMonthTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card shadow-sm border-0 text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title mb-2">Annual Expenses</h5>
                        <p className="card-text display-6 fw-bold text-success mb-0">${annualTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Expense Bar Chart */}
            <div className="row justify-content-center mt-5">
              <div className="col-12 col-md-10">
                <div className="card shadow-sm border-0 p-4 mb-4">
                  <Bar data={barData} options={barOptions} height={100} />
                </div>
              </div>
            </div>
            {/* Categorical Pie Chart */}
            <div className="row justify-content-center mt-4">
              <div className="col-12 col-md-8">
                <div className="card shadow-sm border-0 p-4">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
