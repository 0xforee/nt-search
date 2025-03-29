import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
  // TODO: Add authentication state management
  const isAuthenticated = true;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
