import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../App';

// Modal component for creating a new admin user
const CreateAdminModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            
            // Create admin user with role='admin'
            const response = await axiosInstance.post('/auth/create-admin', {
                ...formData,
                role: 'admin'
            });
            
            if (response.data.success) {
                toast.success('Admin created successfully!');
                navigate('./Dashboard/AdminDash')
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    phone: '',
                    address: ''
                });
            } else {
                toast.error(response.data.message || 'Failed to create admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            toast.error(error.response?.data?.message || 'Failed to create admin');
            
            // Handle validation errors from server
            if (error.response?.status === 400 && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Admin</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>
                    
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal component for displaying loan details
const LoanDetailsModal = ({ loan, onClose, onUpdateStatus }) => {
    if (!loan) return null;
    
    // Convert nested objects to readable format
    const formatNestedObject = (obj, indent = 0) => {
        if (!obj) return 'N/A';
        
        return Object.entries(obj).map(([key, value]) => {
            const indentSpace = ' '.repeat(indent * 2);
            
            // Skip empty arrays
            if (Array.isArray(value) && value.length === 0) {
                return null;
            }
            
            // Format the key for display
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                    <div key={key} className="mb-2">
                        <div className="font-medium">{indentSpace}{formattedKey}:</div>
                        <div className="pl-4">
                            {formatNestedObject(value, indent + 1)}
                        </div>
                    </div>
                );
            } else if (Array.isArray(value)) {
                return (
                    <div key={key} className="mb-2">
                        <div className="font-medium">{indentSpace}{formattedKey}:</div>
                        <div className="pl-4">
                            {value.length > 0 ? value.map((item, index) => (
                                <div key={index} className="mb-1">
                                    {typeof item === 'object' && item !== null 
                                        ? formatNestedObject(item, indent + 1)
                                        : item.toString()}
                                </div>
                            )) : 'None'}
                        </div>
                    </div>
                );
            } else {
                // Format date strings
                let displayValue = value;
                if (key.toLowerCase().includes('date') && value) {
                    try {
                        displayValue = new Date(value).toLocaleString();
                    } catch (e) {
                        console.error('Error formatting date:', e);
                    }
                }
                
                return (
                    <div key={key} className="mb-1">
                        <span className="font-medium">{indentSpace}{formattedKey}: </span>
                        <span>{displayValue !== null && displayValue !== undefined ? displayValue.toString() : 'N/A'}</span>
                    </div>
                );
            }
        }).filter(Boolean); // Remove null entries
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Loan Application Details</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-blue-800">Application Summary</h3>
                            <div className="text-sm">
                                <div className="mb-1"><span className="font-medium">Loan ID: </span>{loan.loanId || loan.id}</div>
                                <div className="mb-1"><span className="font-medium">Applicant: </span>{loan.userName || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Email: </span>{loan.userEmail || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Status: </span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.status === 'Approved' ? 'bg-green-100 text-green-800' : loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {loan.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="mb-1"><span className="font-medium">Date Applied: </span>
                                    {loan.applicationDate ? new Date(loan.applicationDate).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-green-800">Loan Details</h3>
                            <div className="text-sm">
                                <div className="mb-1"><span className="font-medium">Loan Type: </span>{loan.loanType || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Amount: </span>₹{loan.loanAmount?.toLocaleString() || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Term: </span>{loan.loanTerm || loan.loanTenure || 'N/A'} months</div>
                                <div className="mb-1"><span className="font-medium">Purpose: </span>{loan.purpose || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">EMI (Estimated): </span>
                                    ₹{Math.round((loan.loanAmount / loan.loanTerm) * (1 + 0.1/12)).toLocaleString() || 'N/A'}/month
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2 border-b pb-2">Personal Information</h3>
                            <div className="text-sm">
                                {formatNestedObject(loan.personalInformation || {})}
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-1">Employment Information</h4>
                                    {formatNestedObject(loan.employmentInfo || {})}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-lg mb-2 border-b pb-2">Financial Information</h3>
                            <div className="text-sm">
                                <div className="mb-1"><span className="font-medium">Monthly Income: </span>₹{loan.monthlyIncome?.toLocaleString() || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Other Income: </span>₹{loan.otherIncome?.toLocaleString() || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Existing Loans: </span>{loan.existingLoans ? 'Yes' : 'No'}</div>
                                <div className="mb-1"><span className="font-medium">Existing EMI: </span>₹{loan.existingEMI?.toLocaleString() || 'N/A'}</div>
                                <div className="mb-1"><span className="font-medium">Credit Score: </span>{loan.creditScore || 'N/A'}</div>
                                
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-1">Bank Details</h4>
                                    {formatNestedObject(loan.bankDetails || {})}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-2 border-b pb-2">Additional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h4 className="font-semibold mb-1">Address Information</h4>
                                {formatNestedObject(loan.currentAddress || {})}
                                
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-1">Identity Information</h4>
                                    {formatNestedObject(loan.identityInformation || {})}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold mb-1">Co-Applicant Information</h4>
                                {loan.coApplicant ? formatNestedObject(loan.coApplicantDetails || {}) : 'No Co-Applicant'}
                                
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-1">Status History</h4>
                                    {loan.statusHistory && loan.statusHistory.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {loan.statusHistory.map((history, index) => (
                                                <li key={index}>
                                                    {history.status} - {new Date(history.date).toLocaleString()}
                                                    {history.comment && ` - ${history.comment}`}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : 'No status history available'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end sticky bottom-0">
                    {loan.status === 'Pending' && (
                        <div className="space-x-3">
                            <button 
                                onClick={() => {
                                    // Get loan ID from either loanId or id
                                    const loanId = loan.loanId || loan.id;
                                    onClose();
                                    // Small delay to make the animation smoother
                                    setTimeout(() => {
                                        onUpdateStatus(loanId, 'Rejected');
                                    }, 300);
                                }}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                            >
                                Reject Application
                            </button>
                            <button 
                                onClick={() => {
                                    // Get loan ID from either loanId or id
                                    const loanId = loan.loanId || loan.id;
                                    onClose();
                                    // Small delay to make the animation smoother
                                    setTimeout(() => {
                                        onUpdateStatus(loanId, 'Approved');
                                    }, 300);
                                }}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                            >
                                Approve Application
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Profile modal component
const ProfileModal = ({ isOpen, onClose, user }) => {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();
    
    if (!isOpen) return null;
    
    const { logout } = useAuth();
    
    const handleLogout = () => {
        // Use the logout function from auth context
        logout();
        toast.success('Logged out successfully');
        onClose(); // Close the modal after logout
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Admin Profile</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="border-b pb-3">
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-lg font-medium">{user?.name || 'Admin User'}</p>
                        </div>
                        
                        <div className="border-b pb-3">
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="text-lg font-medium">{user?.email || 'admin@example.com'}</p>
                        </div>
                        
                        <div className="border-b pb-3">
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="text-lg font-medium capitalize">{user?.role || 'admin'}</p>
                        </div>
                        
                        <div className="border-b pb-3">
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-lg font-medium">{user?.phone || 'Not available'}</p>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-lg font-medium">{user?.address || 'Not available'}</p>
                        </div>
                        
                        {/* Prominent Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 12.59L5.41 10 10 5.41 11.41 4 16 8.59 11.41 13.17 10 14.59z" clipRule="evenodd" />
                            </svg>
                            Logout from Admin Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentLoans, setRecentLoans] = useState([]);
    const navigate = useNavigate();
    const { user, setUser, isAuthenticated, setIsAuthenticated, logout } = useAuth();
    
    const [loanApplications, setLoanApplications] = useState([]);
    const [stats, setStats] = useState({
        totalLoans: 0,
        pendingLoans: 0,
        approvedLoans: 0,
        rejectedLoans: 0,
        totalAmount: 0
    });
    const [errorMessage, setErrorMessage] = useState('');

    // Open the loan details modal
    const openLoanDetails = (loan) => {
        setSelectedLoan(loan);
        setIsModalOpen(true);
    };

    // Close the loan details modal
    const closeLoanModal = () => {
        setSelectedLoan(null);
        setIsModalOpen(false);
    };

    // Reference for the dropdown
    const dropdownRef = useRef(null);
    const dropdownButtonRef = useRef(null);
    
    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Only close if clicking outside both the dropdown and the button that opens it
            if (
                isProfileDropdownOpen && 
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                dropdownButtonRef.current && 
                !dropdownButtonRef.current.contains(event.target)
            ) {
                setIsProfileDropdownOpen(false);
            }
        };
        
        // Add the event listener
        document.addEventListener('mousedown', handleClickOutside);
        
        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    // Load real data from backend APIs
    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            
            try {
                // Log current user information from auth context
                console.log('Current user info:', user);
                console.log('User role:', user?.role);
                
                if (!user || user.role !== 'admin') {
                    toast.error('You do not have permission to access the admin dashboard.');
                    navigate('/');
                    return;
                }
                
                console.log('Making dashboard requests for admin user');
                
                // Fetch admin dashboard stats
                const statsResponse = await axiosInstance.get('/loans/admin/stats');
                console.log('Stats response:', statsResponse.data);
                
                if (statsResponse.data.success) {
                    setStats(statsResponse.data.data);
                }
                
                // Fetch recent loans
                const loansResponse = await axiosInstance.get('/loans/admin/all-loans');
                console.log('Loans response:', loansResponse.data);
                
                if (loansResponse.data.success) {
                    // Format loans for display
                    const formatted = loansResponse.data.data.map(loan => ({
                        id: loan.loanId,
                        user: loan.userName || 'Unknown',
                        type: loan.loanType,
                        amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(loan.loanAmount),
                        date: new Date(loan.applicationDate).toLocaleDateString(),
                        status: loan.status
                    }));
                    
                    console.log('Formatted loans:', formatted);
                    setRecentLoans(formatted);
                }
                
                // Fetch recent users
                const usersResponse = await axiosInstance.get('/loans/admin/recent-users');
                console.log('Users response:', usersResponse.data);
                
                if (usersResponse.data.success) {
                    setRecentUsers(usersResponse.data.data);
                }
                
            } catch (error) {
                console.error('Error loading admin dashboard:', error);
                toast.error('Failed to load admin dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [navigate, user]);

    // Handle loan approval
    const handleUpdateStatus = async (loanId, status) => {
        setIsUpdating(true);
        setUpdateMessage('');
        setUpdateError('');
        
        try {
            const response = await axiosInstance.put('/loans/admin/update-status', { loanId, status });
            
            if (response.data.success) {
                // Update the loan status in the UI
                const updatedLoans = recentLoans.map(loan => {
                    if (loan.id === loanId) {
                        return { ...loan, status };
                    }
                    return loan;
                });
                
                setRecentLoans(updatedLoans);
                setUpdateMessage(`Loan #${loanId} has been ${status.toLowerCase()} successfully.`);
                
                // Refresh the dashboard stats to reflect the updated status
                refreshStats();
                
                // Clear the message after 5 seconds
                setTimeout(() => {
                    setUpdateMessage('');
                }, 5000);
            } else {
                setUpdateError(`Failed to update loan status: ${response.data.message || 'Unknown error'}`); 
                setTimeout(() => {
                    setUpdateError('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error updating loan status:', error);
            setUpdateError(`Error updating loan status: ${error.response?.data?.message || error.message || 'Unknown error'}`);
            setTimeout(() => {
                setUpdateError('');
            }, 5000);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Handle loan application deletion
    const handleDeleteApplication = async (loanId) => {
        if (!window.confirm('Are you sure you want to delete this loan application? This action cannot be undone.')) {
            return;
        }
        
        setIsUpdating(true);
        setUpdateMessage('');
        setUpdateError('');
        
        try {
            const response = await axiosInstance.delete(`/loans/admin/loan/${loanId}`);
            
            if (response.data.success) {
                // Remove the loan from the UI
                const updatedLoans = recentLoans.filter(loan => loan.id !== loanId);
                setRecentLoans(updatedLoans);
                setUpdateMessage(`Loan application #${loanId} has been deleted successfully.`);
                
                // Refresh the dashboard stats
                refreshStats();
                
                // Clear the message after 5 seconds
                setTimeout(() => {
                    setUpdateMessage('');
                }, 5000);
            } else {
                setUpdateError(`Failed to delete loan application: ${response.data.message || 'Unknown error'}`);
                setTimeout(() => {
                    setUpdateError('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error deleting loan application:', error);
            setUpdateError(`Error deleting loan application: ${error.response?.data?.message || error.message || 'Unknown error'}`);
            setTimeout(() => {
                setUpdateError('');
            }, 5000);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Refresh dashboard statistics
    const refreshStats = async () => {
        try {
            const response = await axiosInstance.get('/loans/admin/stats');
            
            if (response.data.success) {
                setStats(response.data.data);
            } else {
                console.error('Failed to refresh stats:', response.data.message);
            }
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'text-green-600 bg-green-100';
            case 'Rejected':
                return 'text-red-600 bg-red-100';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'Under Review':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };
    
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Loading admin dashboard...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we fetch the latest data.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            
            <header className="bg-white shadow-sm">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>
                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                            </div>
                            <div className="relative">
                                <button 
                                    ref={dropdownButtonRef}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent event from bubbling up
                                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                                    }}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                        {user?.name?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {isProfileDropdownOpen && (
                                    <div 
                                        ref={dropdownRef}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent event from bubbling up
                                                setIsProfileModalOpen(true);
                                                setIsProfileDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                Profile
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent event from bubbling up
                                                // Use the logout function from auth context
                                                logout();
                                                toast.success('Logged out successfully');
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm4 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    <path d="M7 14l5-5-5-5v10z" />
                                                </svg>
                                                Logout
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Status update messages */}
                {updateMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{updateMessage}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {updateError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{updateError}</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                            </div>
                            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalAmount}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loan Applications */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Recent Loan Applications</h2>
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View All Loans
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.user}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openLoanDetails(loan)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                View Details
                                            </button>
                                            {loan.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(loan.id, 'Approved')} 
                                                        disabled={isUpdating}
                                                        className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isUpdating ? 'Updating...' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(loan.id, 'Rejected')}
                                                        disabled={isUpdating}
                                                        className="text-red-600 hover:text-red-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(loan.id, 'Under Review')}
                                                        disabled={isUpdating}
                                                        className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Review
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDeleteApplication(loan.id)}
                                                disabled={isUpdating}
                                                title="Delete Application"
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
                        <div className="flex space-x-3">
                            <button 
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => setIsCreateAdminModalOpen(true)}
                            >
                                Create Admin
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                View All Users
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loans</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joined}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.loanCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                                            <button className="text-yellow-600 hover:text-yellow-900 mr-3">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            
            {/* Loan Details Modal */}
            {isModalOpen && selectedLoan && (
                <LoanDetailsModal loan={selectedLoan} onClose={closeLoanModal} onUpdateStatus={handleUpdateStatus} />
            )}
            
            {/* Create Admin Modal */}
            {isCreateAdminModalOpen && (
                <CreateAdminModal isOpen={isCreateAdminModalOpen} onClose={() => setIsCreateAdminModalOpen(false)} />
            )}
            
            {/* Profile Modal */}
            {isProfileModalOpen && (
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} />
            )}
        </div>
    );
};

export default AdminDashboard;