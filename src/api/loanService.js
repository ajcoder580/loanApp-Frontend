import axiosInstance from './axiosConfig';

// Get all available loan types
export const getLoanTypes = async () => {
  const response = await axiosInstance.get('/loans/types');
  
  if (response.data.success) {
    return response.data.loanTypes;
  }
  throw new Error(response.data.message || 'Failed to fetch loan types');
};

// Get user's loan applications
export const getUserLoans = async () => {
  const response = await axiosInstance.get('/loans/my-loans');
  
  if (response.data.success) {
    return response.data.loans;
  }
  throw new Error(response.data.message || 'Failed to fetch user loans');
};

// Apply for a new loan
export const applyForLoan = async (loanData) => {
  const response = await axiosInstance.post('/loans', loanData);
  
  if (response.data.success) {
    return response.data.loan;
  }
  throw new Error(response.data.message || 'Failed to apply for loan');
};

// Get admin loan applications (for admin dashboard)
export const getAdminLoans = async () => {
  const response = await axiosInstance.get('/loans/admin');
  
  if (response.data.success) {
    return response.data.loans;
  }
  throw new Error(response.data.message || 'Failed to fetch admin loans');
};

// Get loan details by ID (for admin review)
export const getLoanById = async (loanId) => {
  const response = await axiosInstance.get(`/loans/${loanId}`);
  
  if (response.data.success) {
    return response.data.loan;
  }
  throw new Error(response.data.message || 'Failed to fetch loan details');
};

// Update loan status (approve/reject)
export const updateLoanStatus = async (loanId, status, comments) => {
  const response = await axiosInstance.put(`/loans/${loanId}/status`, {
    status,
    adminComments: comments
  });
  
  if (response.data.success) {
    return response.data.loan;
  }
  throw new Error(response.data.message || 'Failed to update loan status');
};
