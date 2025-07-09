import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Inbox from './pages/Inbox';
import Compose from './pages/Compose';
import MailView from './pages/MailView';
import Labels from './pages/Labels';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';


function App() {
  return (
    <ThemeProvider> {}
      <AuthProvider> {}
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {}
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/labels" element={<ProtectedRoute><Labels /></ProtectedRoute>} />
            <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
            <Route path="/mail/:id" element={<ProtectedRoute><MailView /></ProtectedRoute>} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
