import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import Login from "./pages/login";
import Signup from "./pages/signup";
import AdminDashboard from "./pages/Dashboard/AdminDash";
import LoanDetail from "./pages/Dashboard/LoanDetail";
import Profile from "./pages/UserProfile/Profile";
import ApplyLoan from "./pages/ApplyLoan";
import axiosInstance from "./api/axiosConfig";

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in localStorage
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token with backend
          const response = await axiosInstance.get('/auth/profile');
          
          if (response.data.success) {
            console.log('Auth check successful:', response.data.user);
            setUser(response.data.user);
          } else {
            // Invalid token
            console.log('Auth check failed:', response.data);
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Function to handle login
  const login = async (userData) => {
    console.log('Login function called with:', userData);
    setUser(userData);
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Log the current auth state
  console.log('Current auth state:', { user, loading });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Protected route component
const ProtectedRoute = ({ element, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { user, loading, requiredRole });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`User role ${user.role} doesn't match required role ${requiredRole}`);
    // If user doesn't have required role, redirect to appropriate page
    if (user.role === 'admin') {
      console.log('Redirecting to admin dashboard');
      return <Navigate to="/Dashboard/AdminDash" replace />;
    } else {
      console.log('Redirecting to user profile');
      return <Navigate to="/UserProfile/Profile" replace />;
    }
  }

  console.log('User authorized, rendering protected content');
  return element;
};

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-teal-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/Dashboard/AdminDash" element={<ProtectedRoute element={<AdminDashboard/>} requiredRole="admin" />}/>
          <Route path="/dashboard/admin/loan/:loanId" element={<ProtectedRoute element={<LoanDetail/>} requiredRole="admin" />}/>
          <Route path="/UserProfile/Profile" element={<ProtectedRoute element={<Profile/>} requiredRole="user" />}/>
          <Route path="/apply-loan/:loanTypeId" element={<ProtectedRoute element={<ApplyLoan/>} />}/>
        </Routes>
      </div>
    </AuthProvider>
  );
}

  


export default App;
