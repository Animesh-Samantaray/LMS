import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import FloatingChatbot from './components/Chatbot/FloatingChatbot';
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-lms-bg text-lms-text transition-colors duration-300">
              <AppRoutes />
              <FloatingChatbot />
              <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px', fontWeight: 'bold' } }} />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;