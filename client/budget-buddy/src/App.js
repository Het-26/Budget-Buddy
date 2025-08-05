import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import Home from './home';
import AddExpense from './AddExpense';
import History from './history';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      {/* <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/" style={{ margin: 10 }}>Login</Link>
        <Link to="/signup" style={{ margin: 10 }}>Sign Up</Link>
      </div> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/expense-history" element={<History />} />
      </Routes>
    </Router>
    
  );
}

export default App;
