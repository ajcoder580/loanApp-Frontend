import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import axiosInstance from "../../api/axiosConfig";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loanTypes, setLoanTypes] = useState([
    { id: 1, name: "Personal Loan", interestRate: "10.5%", maxAmount: "₹1,000,000", tenure: "12-60 months" },
    { id: 2, name: "Home Loan", interestRate: "8.5%", maxAmount: "₹10,000,000", tenure: "5-30 years" },
    { id: 3, name: "Education Loan", interestRate: "9.0%", maxAmount: "₹2,000,000", tenure: "1-7 years" }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loanError, setLoanError] = useState(null);
  
  // New state variables
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [isLoanDetailsOpen, setIsLoanDetailsOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [userStats, setUserStats] = useState({
    totalLoans: 0,
    approvedLoans: 0,
    pendingLoans: 0,
    totalAmount: "₹0",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to access this page");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user profile from Express backend
        const response = await axiosInstance.get('/auth/profile');
        
        if (response.data.success) {
          // Check if the user has the correct role
          if (response.data.user.role !== "user") {
            toast.error("Unauthorized access");
            navigate("/login");
            return;
          }
          
          setUser(response.data.user);
          
          // Get user's loans
          await fetchUserLoans();
          
          setIsLoading(false);
        } else {
          toast.error("Failed to load profile");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
        setIsLoading(false);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch user's loan applications
  const fetchUserLoans = async () => {
    setLoadingLoans(true);
    setLoanError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      // Get user loans from Express backend
      const response = await axiosInstance.get('/loans/my-loans');
      console.log('Loans response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Backend sends loan data in the 'data' property, not 'loans'
        const formattedLoans = response.data.data.map(loan => ({
          id: loan.loanId,
          type: loan.loanType || 'Unknown',
          amount: parseFloat(loan.loanAmount),
          amountFormatted: `₹${parseFloat(loan.loanAmount).toLocaleString()}`,
          status: loan.status,
          date: new Date(loan.applicationDate).toLocaleDateString(),
          applicationDate: new Date(loan.applicationDate),
          purpose: loan.purpose,
          tenure: `${loan.loanTerm || 0} months`,
          interestRate: `${loan.interestRate || 0}%`,
          // Add any additional fields needed for the loan details modal
          loanTerm: loan.loanTerm || 0,
          interestRateValue: loan.interestRate || 0,
          employmentType: loan.employmentType || 'Not specified',
          monthlyIncome: loan.monthlyIncome ? `₹${parseFloat(loan.monthlyIncome).toLocaleString()}` : 'Not specified',
          approvalDate: loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString() : null,
        }));
        
        console.log('Formatted loans:', formattedLoans);
        setLoans(formattedLoans);
        
        // Calculate user statistics
        const totalLoans = formattedLoans.length;
        const approvedLoans = formattedLoans.filter(loan => loan.status === 'Approved').length;
        const pendingLoans = formattedLoans.filter(loan => loan.status === 'Pending').length;
        
        // Calculate total approved loan amount
        const totalAmount = formattedLoans
          .filter(loan => loan.status === 'Approved')
          .reduce((total, loan) => total + loan.amount, 0);
          
        setUserStats({
          totalLoans,
          approvedLoans,
          pendingLoans,
          totalAmount: `₹${totalAmount.toLocaleString()}`
        });
      } else {
        // Empty array if no loans found
        setLoans([]);
        setUserStats({
          totalLoans: 0,
          approvedLoans: 0,
          pendingLoans: 0,
          totalAmount: "₹0"
        });
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoanError('Failed to load your loan applications');
      setLoans([]);
      setUserStats({
        totalLoans: 0,
        approvedLoans: 0,
        pendingLoans: 0,
        totalAmount: "₹0"
      });
    } finally {
      setLoadingLoans(false);
    }
  };
  
  const handleLogout = () => {
    try {
      // Clear token from local storage
      localStorage.removeItem('token');
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('An error occurred while signing out');
    }
  };
  
  // Handle initiating profile edit mode
  const handleEditProfile = () => {
    setEditedUser({...user});
    setIsEditMode(true);
  };
  
  // Handle saving profile changes
  const handleSaveProfile = async () => {
    try {
      // In a real application, you would send the updated profile to the server
       // await axiosInstance.put('/auth/update-profile', editedUser);
      
      // For now, we'll just update the local state
      setUser(editedUser);
      setIsEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  // Handle changes to the edited user form
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle opening the loan details modal
  const openLoanDetails = (loan) => {
    setSelectedLoan(loan);
    setIsLoanDetailsOpen(true);
  };
  
  // Handle closing the loan details modal
  const closeLoanDetails = () => {
    setIsLoanDetailsOpen(false);
    setSelectedLoan(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-md w-full transform transition-all duration-300 hover:shadow-xl">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we fetch your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <ToastContainer />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Welcome, {user?.name.toUpperCase() || 'User'}</h1>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-indigo-50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
              <span className="text-sm font-medium text-indigo-600">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
            </div>
          </div>
        </div>
        
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.totalLoans}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved Loans</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.approvedLoans}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.pendingLoans}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Loan Amount</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.totalAmount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 md:col-span-2 transform transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h2>
              {!isEditMode && (
                <button 
                  onClick={handleEditProfile}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
              
            {isEditMode ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editedUser?.name || ''}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editedUser?.email || ''}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={editedUser?.phone || ''}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={editedUser?.address || ''}
                      onChange={handleUserFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="bg-indigo-50 p-4 rounded-lg hover:shadow-md transition-all duration-200">
                  <p className="text-sm font-medium text-indigo-500 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.name.toUpperCase() || 'Not provided'}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg hover:shadow-md transition-all duration-200">
                  <p className="text-sm font-medium text-indigo-500 mb-1">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg hover:shadow-md transition-all duration-200">
                  <p className="text-sm font-medium text-indigo-500 mb-1">Account Type</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.role === 'admin' ? 'Administrator' : 'Regular User'}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg hover:shadow-md transition-all duration-200">
                  <p className="text-sm font-medium text-indigo-500 mb-1">Account ID</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.id ? user.id.substring() : 'Not available'}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col h-full transform transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Quick Actions
              </h2>
              <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 flex items-center py-2 px-3 rounded-lg hover:bg-red-50 transition-all duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
            
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <button 
                  onClick={() => navigate("/UserProfile/Profile")} 
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium transform hover:scale-[1.02] hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  My Profile
                </button>
                
                <button 
                  onClick={fetchUserLoans}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-200 transition-all duration-200 font-medium transform hover:scale-[1.02]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh Loan Status
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loan History */}
        <div className="bg-white shadow-lg rounded-xl mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Loan Applications
            </h2>
            <button 
              onClick={fetchUserLoans}
              className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 font-medium transform hover:scale-[1.02]"
              disabled={loadingLoans}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {loadingLoans ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="px-6 py-5">
          
          {loanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>{loanError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loadingLoans ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Loading loans...</span>
            </div>
          ) : loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100 rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-3 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Purpose</th>
                    <th className="px-3 py-3 bg-indigo-50 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr 
                      key={loan.id} 
                      className="hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{loan.type}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{loan.amountFormatted || `₹${loan.amount?.toLocaleString()}`}</div>
                        <div className="text-xs text-gray-500">{loan.interestRate} / {loan.tenure}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${loan.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.date}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.purpose}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          type="button"
                          onClick={() => {
                            console.log('Opening loan details for:', loan);
                            setSelectedLoan({
                              ...loan,
                              amountFormatted: loan.amountFormatted || `₹${loan.amount?.toLocaleString()}`
                            });
                            setIsLoanDetailsOpen(true);
                          }}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium py-1 px-3 rounded-md transition-colors duration-200"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-indigo-50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Loan Applications</h3>
              <p className="text-sm text-gray-600 mb-4">You haven't applied for any loans yet.</p>
              <div className="mt-2">
                <button 
                  onClick={() => navigate(`/apply-loan/${loanTypes[0]?.id || 1}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-[1.02]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Apply for a Loan
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
        
        {/* Available Loan Types */}
        <div className="bg-white shadow-lg rounded-xl mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="px-6 py-4 bg-indigo-50 border-b">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Available Loan Types
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanTypes.map((loanType) => (
                <div key={loanType.id} className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className={`h-2 ${loanType.id % 3 === 0 ? 'bg-purple-500' : loanType.id % 2 === 0 ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{loanType.name}</h3>
                    <ul className="space-y-2 mb-5">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><span className="font-medium">Interest Rate:</span> <span className="text-gray-700">{loanType.interestRate}</span></span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><span className="font-medium">Maximum Amount:</span> <span className="text-gray-700">{loanType.maxAmount}</span></span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><span className="font-medium">Tenure:</span> <span className="text-gray-700">{loanType.tenure}</span></span>
                      </li>
                    </ul>
                    <button 
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-sm flex items-center justify-center transform hover:scale-[1.02]"
                      onClick={() => navigate(`/apply-loan/${loanType.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Loan Details Modal */}
      {/* Debugging info */}
      <div className="hidden">
        <p>isLoanDetailsOpen: {isLoanDetailsOpen ? 'true' : 'false'}</p>
        <p>selectedLoan: {selectedLoan ? 'exists' : 'null'}</p>
      </div>
      
      {isLoanDetailsOpen && selectedLoan && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsLoanDetailsOpen(false)}></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Loan Application Details
                  </h3>
                  
                  <div className="mt-4">
                    <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg text-gray-900">{selectedLoan.type}</h4>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${selectedLoan.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          selectedLoan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                          {selectedLoan.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                        <p className="text-base font-semibold text-gray-900">{selectedLoan.amountFormatted}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Application Date</p>
                        <p className="text-base font-semibold text-gray-900">{selectedLoan.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                        <p className="text-base font-semibold text-gray-900">{selectedLoan.interestRate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tenure</p>
                        <p className="text-base font-semibold text-gray-900">{selectedLoan.tenure}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-500">Purpose</p>
                      <p className="text-base font-semibold text-gray-900">{selectedLoan.purpose}</p>
                    </div>
                    
                    {selectedLoan.status === 'Approved' && (
                      <div className="rounded-md bg-green-50 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Loan Approved</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Your loan was approved on {selectedLoan.approvalDate || 'N/A'}. The funds will be disbursed to your registered bank account.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedLoan.status === 'Rejected' && (
                      <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Loan Rejected</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>Your loan application was rejected. Please contact customer support for more information.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedLoan.status === 'Pending' && (
                      <div className="rounded-md bg-yellow-50 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Application Under Review</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Your loan application is currently under review. This process typically takes 2-3 business days.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={() => {
                    console.log('Closing loan details modal');
                    setIsLoanDetailsOpen(false);
                    setTimeout(() => setSelectedLoan(null), 300);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
