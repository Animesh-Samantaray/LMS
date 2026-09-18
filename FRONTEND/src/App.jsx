import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-lms-bg text-lms-text transition-colors duration-300">
            <AppRoutes />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;