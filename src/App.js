import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import NavMenu from './components/NavMenu';
import MemberForm from './components/MemberForm';
import MemberList from './components/MemberList';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import MemberSummary from './components/MemberSummary'; // Import MemberSummary
import { isAuthenticated, isSuperUser } from './utils/auth';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="App">
      {!isLoginPage && isAuthenticated() && <NavMenu />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/add-member" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
        <Route path="/member-list" element={<ProtectedRoute><MemberList /></ProtectedRoute>} />
        <Route 
          path="/register" 
          element={
            <ProtectedRoute>
              {isSuperUser() ? <Register /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route path="/member-summary" element={<ProtectedRoute><MemberSummary /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;