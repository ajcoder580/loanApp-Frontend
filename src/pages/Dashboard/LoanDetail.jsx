import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState({});
  
  // Fetch loan details
  useEffect(() => {
    const fetchLoanDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8080/loans/admin/loan/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setLoan(response.data.data);
        } else {
          toast.error('Failed to load loan details');
        }
      } catch (error) {
        console.error('Error fetching loan details:', error);
        if (error.response?.status === 404) {
          toast.error('Loan application not found');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to view this loan');
          navigate('/dashboard/admin');
        } else {
          toast.error('Error loading loan details');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [loanId, navigate]);
  
  // Handle status update
  const handleUpdateStatus = async (status) => {
    try {
      setIsUpdating(true);
      setUpdateMessage(null);
      setUpdateError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Make API request to update status
      const response = await axios.put(
        'http://localhost:8080/loans/admin/update-status',
        { loanId: loan.loanId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update the local state
        setLoan(prevLoan => ({
          ...prevLoan,
          status
        }));
        
        // Show success message
        setUpdateMessage(`Loan application status updated to ${status} successfully!`);
        toast.success(`Status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
      setUpdateError('Failed to update loan status. ' + 
        (error.response?.data?.message || error.message));
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
      // Clear messages after 5 seconds
      setTimeout(() => {
        setUpdateMessage(null);
        setUpdateError(null);
      }, 5000);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'under review':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading loan details...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }
  
  if (!loan) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700">Loan not found</h2>
          <p className="text-gray-500 mt-2">The requested loan application could not be found.</p>
          <button 
            onClick={() => navigate('/dashboard/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <header className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/admin')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Loan Application Details</h1>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                {loan.status}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status update messages */}
        {updateMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Basic Details */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Loan Application #{loan.loanId}</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Application Date</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(loan.applicationDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan Type</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.loanType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                  <p className="mt-1 text-sm text-gray-900">₹{loan.loanAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan Tenure</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.loanTenure} months</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Loan Purpose</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.loanPurpose}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Purpose Description</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.purpose}</p>
                </div>
              </div>
            </div>
            
            {/* Applicant Information */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Applicant Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Applicant Name</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employment Type</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.employmentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                  <p className="mt-1 text-sm text-gray-900">₹{loan.monthlyIncome?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Annual Income</p>
                  <p className="mt-1 text-sm text-gray-900">₹{loan.annualIncome?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Credit Score</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.creditScore}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Residential Status</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.residentialStatus}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Existing Loans</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.existingLoans || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Co-Applicant</p>
                  <p className="mt-1 text-sm text-gray-900">{loan.coApplicant ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Repayment Capacity</p>
                  <p className="mt-1 text-sm text-gray-900">₹{loan.repaymentCapacity?.toLocaleString()} per month</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Actions */}
          <div>
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Current status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>{loan.status}</span>
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleUpdateStatus('Approved')}
                    disabled={isUpdating || loan.status === 'Approved'}
                    className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white 
                      ${loan.status === 'Approved' ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {isUpdating ? 'Updating...' : 'Approve Application'}
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus('Rejected')}
                    disabled={isUpdating || loan.status === 'Rejected'}
                    className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white 
                      ${loan.status === 'Rejected' ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  >
                    Reject Application
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus('Under Review')}
                    disabled={isUpdating || loan.status === 'Under Review'}
                    className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white 
                      ${loan.status === 'Under Review' ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Mark as Under Review
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus('Pending')}
                    disabled={isUpdating || loan.status === 'Pending'}
                    className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white 
                      ${loan.status === 'Pending' ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                  >
                    Mark as Pending
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => navigate('/dashboard/admin')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
            
            {/* Document Viewer */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Application Documents</h2>
              </div>
              <div className="p-6">
                {loan.documents ? (
                  <div className="space-y-4">
                    {/* Identity Proof */}
                    {loan.documents.identityProof && loan.documents.identityProof.filename && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Identity Proof</p>
                            <p className="text-xs text-gray-500">{loan.documents.identityProof.filename}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDocumentLoading(prev => ({ ...prev, identityProof: true }));
                            window.open(`http://localhost:8080/loans/admin/loan/${loan.loanId}/document/identityProof`, '_blank');
                            setTimeout(() => setDocumentLoading(prev => ({ ...prev, identityProof: false })), 1000);
                          }}
                          disabled={documentLoading.identityProof}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {documentLoading.identityProof ? 'Opening...' : 'View Document'}
                        </button>
                      </div>
                    )}
                    
                    {/* Address Proof */}
                    {loan.documents.addressProof && loan.documents.addressProof.filename && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Address Proof</p>
                            <p className="text-xs text-gray-500">{loan.documents.addressProof.filename}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDocumentLoading(prev => ({ ...prev, addressProof: true }));
                            window.open(`http://localhost:8080/loans/admin/loan/${loan.loanId}/document/addressProof`, '_blank');
                            setTimeout(() => setDocumentLoading(prev => ({ ...prev, addressProof: false })), 1000);
                          }}
                          disabled={documentLoading.addressProof}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {documentLoading.addressProof ? 'Opening...' : 'View Document'}
                        </button>
                      </div>
                    )}
                    
                    {/* Income Proof */}
                    {loan.documents.incomeProof && loan.documents.incomeProof.filename && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Income Proof</p>
                            <p className="text-xs text-gray-500">{loan.documents.incomeProof.filename}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDocumentLoading(prev => ({ ...prev, incomeProof: true }));
                            window.open(`http://localhost:8080/loans/admin/loan/${loan.loanId}/document/incomeProof`, '_blank');
                            setTimeout(() => setDocumentLoading(prev => ({ ...prev, incomeProof: false })), 1000);
                          }}
                          disabled={documentLoading.incomeProof}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {documentLoading.incomeProof ? 'Opening...' : 'View Document'}
                        </button>
                      </div>
                    )}
                    
                    {/* Bank Statements */}
                    {loan.documents.bankStatements && loan.documents.bankStatements.filename && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Bank Statements</p>
                            <p className="text-xs text-gray-500">{loan.documents.bankStatements.filename}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDocumentLoading(prev => ({ ...prev, bankStatements: true }));
                            window.open(`http://localhost:8080/loans/admin/loan/${loan.loanId}/document/bankStatements`, '_blank');
                            setTimeout(() => setDocumentLoading(prev => ({ ...prev, bankStatements: false })), 1000);
                          }}
                          disabled={documentLoading.bankStatements}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {documentLoading.bankStatements ? 'Opening...' : 'View Document'}
                        </button>
                      </div>
                    )}
                    
                    {/* Additional Documents */}
                    {loan.documents.additionalDocuments && loan.documents.additionalDocuments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Documents</h3>
                        <div className="space-y-3">
                          {loan.documents.additionalDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <svg className="h-6 w-6 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{doc.docType || `Document ${index + 1}`}</p>
                                  <p className="text-xs text-gray-500">{doc.filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setDocumentLoading(prev => ({ ...prev, [`additional_${index}`]: true }));
                                  window.open(`http://localhost:8080/loans/admin/loan/${loan.loanId}/document/additionalDocuments/${index}`, '_blank');
                                  setTimeout(() => setDocumentLoading(prev => ({ ...prev, [`additional_${index}`]: false })), 1000);
                                }}
                                disabled={documentLoading[`additional_${index}`]}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {documentLoading[`additional_${index}`] ? 'Opening...' : 'View Document'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                    <p className="mt-1 text-sm text-gray-500">This application doesn't have any documents attached.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Application Timeline */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Timeline</h2>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Application <span className="font-medium text-gray-900">submitted</span></p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(loan.applicationDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Current status: <span className="font-medium text-gray-900">{loan.status}</span></p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              Now
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanDetail;
