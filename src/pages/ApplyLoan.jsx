import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosConfig";

const ApplyLoan = () => {
  const navigate = useNavigate();
  const { loanTypeId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  // Define enhanced loan types based on the updated schema
  const loanTypes = [
    { id: 1, name: "Personal Loan", interestRate: 10.5, maxAmount: 1000000, tenure: "12-60 months", processingFee: "1-2%", description: "For personal expenses like travel, wedding, etc." },
    { id: 2, name: "Home Loan", interestRate: 8.5, maxAmount: 10000000, tenure: "60-360 months", processingFee: "0.5-1%", description: "For purchasing or renovating residential property" },
    { id: 3, name: "Education Loan", interestRate: 9.0, maxAmount: 2000000, tenure: "12-84 months", processingFee: "0.5-1%", description: "For higher education expenses in India or abroad" },
    { id: 4, name: "Vehicle Loan", interestRate: 9.5, maxAmount: 3000000, tenure: "12-84 months", processingFee: "1-2%", description: "For purchasing new or used vehicles" },
    { id: 5, name: "Business Loan", interestRate: 12.0, maxAmount: 5000000, tenure: "12-60 months", processingFee: "1-3%", description: "For business expansion, working capital or equipment" },
    { id: 6, name: "Gold Loan", interestRate: 7.5, maxAmount: 2000000, tenure: "6-36 months", processingFee: "0.5-1%", description: "Loan against gold jewelry or coins" },
    { id: 7, name: "Loan Against Property", interestRate: 9.0, maxAmount: 20000000, tenure: "60-180 months", processingFee: "0.5-1%", description: "Loan against residential or commercial property" }
  ];
  
  // Find the selected loan type
  const selectedLoanType = loanTypes.find(loan => loan.id === parseInt(loanTypeId)) || loanTypes[0];
  
  // Initial form state matching the enhanced MongoDB schema
  const [formData, setFormData] = useState({
    // Basic Loan Information
    loanAmount: "",
    loanTerm: "12", // Default term in months
    loanTenure: "12", // Required by backend schema
    purpose: "",
    loanType: selectedLoanType ? selectedLoanType.name : "Personal Loan",
    loanPurpose: "Personal Expenses",
    interestRate: selectedLoanType ? selectedLoanType.interestRate : 10.5,
    processingFee: selectedLoanType ? 
      (typeof selectedLoanType.processingFee === 'string' ? 
        parseFloat(selectedLoanType.processingFee.replace(/%/g, '')) : 
        selectedLoanType.processingFee) : 
      1.5, // Convert string to number
    
    // Financial Information
    monthlyIncome: "",
    annualIncome: "",
    otherIncome: "",
    totalMonthlyExpenses: "",
    existingLoans: "No",
    existingEMI: "0",
    creditScore: "",
    repaymentCapacity: "0", // Required by backend
    
    // Applicant Information
    applicantDetails: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "Male",
      maritalStatus: "Single",
      phone: "",
      email: "",
      education: "Bachelor's",
      dependents: "0"
    },
    
    // Employment Information
    employmentType: "Salaried",
    employmentDetails: {
      employerName: "",
      position: "",
      yearsAtCurrentEmployer: "",
      monthlySalary: "",
      sector: "Information Technology"
    },
    
    // Residence Information
    residentialStatus: "Owned",
    residentialAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India"
    },
    yearsAtCurrentAddress: "",
    
    // Bank Details
    bankDetails: {
      accountNumber: "",
      accountType: "Savings",
      bankName: "",
      ifscCode: "",
      accountHolderName: ""
    },
    
    // Co-applicant Information
    coApplicant: false,
    coApplicantDetails: {
      fullName: "",
      relationship: "Spouse", // Setting default enum value
      monthlyIncome: "0"
    },
    
    // Identity Information (required by backend)
    identityInformation: {
      idType: "Aadhar Card", // Matching the enum values in backend schema
      idNumber: "000000000000" // Default placeholder
    }
  });
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to apply for a loan");
      navigate("/login");
      return;
    }

    // Get user data from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!userData || !userData.id) {
        throw new Error("User data not found");
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error loading profile data");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (fields with dot notation like 'applicantDetails.firstName')
    if (name.includes('.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Function to handle co-applicant toggle
  const handleCoApplicantToggle = (e) => {
    const isCoApplicant = e.target.value === "true";
    setFormData(prev => ({
      ...prev,
      coApplicant: isCoApplicant,
      // Ensure relationship is set to a valid enum value when toggling
      coApplicantDetails: {
        ...prev.coApplicantDetails,
        relationship: isCoApplicant ? prev.coApplicantDetails.relationship || "Spouse" : "Spouse"
      }
    }));
  };

  // Function to navigate to the next step
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to navigate to the previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate current step before proceeding
  const validateStep = (step) => {
    let isValid = true;
    let errorMessage = "";

    switch (step) {
      case 1: // Basic Loan Information
        if (!formData.loanAmount || isNaN(formData.loanAmount) || formData.loanAmount < 1000 || formData.loanAmount > 10000000) {
          isValid = false;
          errorMessage = "Loan amount must be between 1,000 and 10,000,000";
        } else if (!formData.loanTerm || isNaN(formData.loanTerm) || formData.loanTerm < 6 || formData.loanTerm > 600) {
          isValid = false;
          errorMessage = "Loan term must be between 6 and 600 months";
        } else if (!formData.purpose || formData.purpose.length < 10) {
          isValid = false;
          errorMessage = "Please provide a valid purpose of at least 10 characters";
        }
        break;

      case 2: // Financial Information
        if (!formData.monthlyIncome || isNaN(formData.monthlyIncome) || formData.monthlyIncome < 10000) {
          isValid = false;
          errorMessage = "Monthly income must be at least 10,000";
        } else if (!formData.annualIncome || isNaN(formData.annualIncome) || formData.annualIncome < 120000) {
          isValid = false;
          errorMessage = "Annual income must be at least 120,000";
        } else if (!formData.creditScore || isNaN(formData.creditScore) || formData.creditScore < 300 || formData.creditScore > 900) {
          isValid = false;
          errorMessage = "Credit score must be between 300 and 900";
        }
        break;

      case 3: // Applicant Information
        if (!formData.applicantDetails.firstName || formData.applicantDetails.firstName.length < 2) {
          isValid = false;
          errorMessage = "First name is required and must be at least 2 characters";
        } else if (!formData.applicantDetails.lastName || formData.applicantDetails.lastName.length < 2) {
          isValid = false;
          errorMessage = "Last name is required and must be at least 2 characters";
        } else if (!formData.applicantDetails.email || !/^\S+@\S+\.\S+$/.test(formData.applicantDetails.email)) {
          isValid = false;
          errorMessage = "Valid email address is required";
        } else if (!formData.applicantDetails.phone || !/^[0-9]{10}$/.test(formData.applicantDetails.phone)) {
          isValid = false;
          errorMessage = "Valid 10-digit phone number is required";
        } else if (!formData.applicantDetails.dateOfBirth) {
          isValid = false;
          errorMessage = "Date of birth is required";
        }
        break;

      case 4: // Employment Information
        if (!formData.employmentDetails.employerName) {
          isValid = false;
          errorMessage = "Employer name is required";
        } else if (!formData.employmentDetails.position) {
          isValid = false;
          errorMessage = "Position is required";
        } else if (!formData.employmentDetails.yearsAtCurrentEmployer || isNaN(formData.employmentDetails.yearsAtCurrentEmployer)) {
          isValid = false;
          errorMessage = "Years at current employer is required and must be a number";
        }
        break;

      case 5: // Residence Information
        if (!formData.residentialAddress.addressLine1) {
          isValid = false;
          errorMessage = "Address line 1 is required";
        } else if (!formData.residentialAddress.city) {
          isValid = false;
          errorMessage = "City is required";
        } else if (!formData.residentialAddress.state) {
          isValid = false;
          errorMessage = "State is required";
        } else if (!formData.residentialAddress.postalCode || !/^[0-9]{6}$/.test(formData.residentialAddress.postalCode)) {
          isValid = false;
          errorMessage = "Valid 6-digit postal code is required";
        } else if (!formData.yearsAtCurrentAddress || isNaN(formData.yearsAtCurrentAddress)) {
          isValid = false;
          errorMessage = "Years at current address is required and must be a number";
        }
        break;

      case 6: // Bank Details
        if (!formData.bankDetails.accountNumber || !/^[0-9]{9,18}$/.test(formData.bankDetails.accountNumber)) {
          isValid = false;
          errorMessage = "Valid account number between 9-18 digits is required";
        } else if (!formData.bankDetails.bankName) {
          isValid = false;
          errorMessage = "Bank name is required";
        } else if (!formData.bankDetails.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
          isValid = false;
          errorMessage = "Valid IFSC code is required (e.g., HDFC0001234)";
        } else if (!formData.bankDetails.accountHolderName) {
          isValid = false;
          errorMessage = "Account holder name is required";
        }
        break;

      default:
        break;
    }

    if (!isValid) {
      toast.error(errorMessage);
    }

    return isValid;
  };

  // Function to handle step navigation with validation
  const handleStepNavigation = (direction) => {
    if (direction === "next") {
      if (validateStep(currentStep)) {
        handleNextStep();
      }
    } else {
      handlePrevStep();
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Perform final validation
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      // Transform form data to match the MongoDB schema structure
      const preparedFormData = {
        // Basic Loan Information
        loanAmount: parseFloat(formData.loanAmount),
        loanTerm: parseInt(formData.loanTerm),
        loanTenure: parseInt(formData.loanTerm), // Map loanTerm to loanTenure (required field)
        purpose: formData.purpose.trim(),
        loanType: formData.loanType,
        loanPurpose: formData.loanPurpose,
        interestRate: parseFloat(formData.interestRate),
        processingFee: typeof formData.processingFee === 'string' ? 
          parseFloat(formData.processingFee.replace(/%/g, '')) : 
          formData.processingFee,
        
        // Financial Information
        monthlyIncome: parseFloat(formData.monthlyIncome),
        // Ensure annual income is within the allowed range (120000 - 120000000)
        annualIncome: Math.min(
          Math.max(
            parseFloat(formData.annualIncome || formData.monthlyIncome * 12),
            120000 // Minimum value
          ),
          120000000 // Maximum value
        ),
        otherIncome: formData.otherIncome ? parseFloat(formData.otherIncome) : 0,
        totalMonthlyExpenses: formData.totalMonthlyExpenses ? parseFloat(formData.totalMonthlyExpenses) : 0,
        existingLoans: formData.existingLoans,
        existingEMI: parseFloat(formData.existingEMI || 0),
        creditScore: parseInt(formData.creditScore),
        repaymentCapacity: Math.max(parseFloat(formData.repaymentCapacity || 1000), 1000), // Ensure minimum value of 1000
        
        // Applicant Information - structure matches schema
        applicantDetails: {
          firstName: formData.applicantDetails.firstName,
          middleName: formData.applicantDetails.middleName || "",
          lastName: formData.applicantDetails.lastName,
          dateOfBirth: formData.applicantDetails.dateOfBirth,
          gender: formData.applicantDetails.gender,
          maritalStatus: formData.applicantDetails.maritalStatus,
          phone: formData.applicantDetails.phone,
          email: formData.applicantDetails.email,
          education: formData.applicantDetails.education,
          dependents: parseInt(formData.applicantDetails.dependents || 0),
          children: 0,
          familyMembers: 1,
          nationality: "Indian",
          preferredContactMethod: "Phone",
          contactTime: "Anytime",
          taxResidencyStatus: "Resident",
          taxFilingStatus: "Regular"
        },
        
        // Employment Information
        employmentType: formData.employmentType,
        employmentDetails: {
          employerName: formData.employmentDetails.employerName,
          position: formData.employmentDetails.position,
          yearsAtCurrentEmployer: Math.max(parseInt(formData.employmentDetails.yearsAtCurrentEmployer || 0), 0), // Ensure minimum value of 0
          employmentStatus: "Permanent",
          monthlySalary: parseFloat(formData.employmentDetails.monthlySalary || 0),
          sector: formData.employmentDetails.sector,
          bonuses: 0,
          otherCompensation: 0,
          employerAddress: {
            country: "India"
          }
        },
        
        // Residence Information
        residentialStatus: formData.residentialStatus,
        residentialAddress: {
          addressLine1: formData.residentialAddress.addressLine1,
          addressLine2: formData.residentialAddress.addressLine2 || "",
          city: formData.residentialAddress.city,
          state: formData.residentialAddress.state,
          postalCode: formData.residentialAddress.postalCode,
          country: "India",
          addressType: "Residential",
          isBillingAddress: true,
          isMailingAddress: true
        },
        yearsAtCurrentAddress: parseInt(formData.yearsAtCurrentAddress || 0),
        monthsAtCurrentAddress: 0,
        previousAddresses: [], // Required by schema
        
        // Bank Details
        bankDetails: {
          accountNumber: formData.bankDetails.accountNumber,
          accountType: formData.bankDetails.accountType,
          bankName: formData.bankDetails.bankName,
          ifscCode: formData.bankDetails.ifscCode,
          accountHolderName: formData.bankDetails.accountHolderName,
          internetBankingEnabled: false
        },
        
        // Co-applicant Information
        coApplicant: formData.coApplicant,
        coApplicantDetails: {
          fullName: formData.coApplicantDetails.fullName || "",
          relationship: formData.coApplicant ? 
            (formData.coApplicantDetails.relationship || "Spouse") : "Spouse",
          monthlyIncome: formData.coApplicantDetails.monthlyIncome ? 
            parseFloat(formData.coApplicantDetails.monthlyIncome) : 0
        },
        
        // Identity Information - required fields
        identityInformation: {
          idType: formData.identityInformation.idType || "Aadhar Card", 
          idNumber: formData.identityInformation.idNumber || "", 
          otherBankAccounts: formData.identityInformation.otherBankAccounts || []
        },
        
        // Processing Info
        processingInfo: {
          internalNotes: [],
          verificationCalls: []
        },
        
        // Required by schema
        statusHistory: [],
        references: [],
        housingLoanDetails: { existingLoan: false },
        
        // System fields
        userId: user.id,
        applicationDate: new Date().toISOString(),
        status: "Pending"
      };

      console.log('Submitting loan application:', preparedFormData);
      const response = await axiosInstance.post('/loans', preparedFormData);

      if (response.data.success) {
        toast.success("Loan application submitted successfully!");
        navigate('/UserProfile/Profile');
      } else {
        toast.error(response.data.message || "Failed to submit loan application");
      }
    } catch (error) {
      console.error('Error submitting loan application:', error);
      console.error('Error response data:', error.response?.data);
      
      // More detailed error logging
      if (error.response?.data?.errors) {
        console.error('Validation errors detail:', error.response.data.errors);
      }
      if (error.response?.data?.missingFields) {
        console.error('Missing fields:', error.response.data.missingFields);
      }
      
      // Build a more informative error message
      let errorMessage;
      if (error.response?.data?.errors) {
        const errorDetails = Object.entries(error.response.data.errors)
          .map(([key, value]) => `${key}: ${value.message || value}`)
          .join('; ');
        errorMessage = `Validation failed: ${errorDetails}`;
      } else if (error.response?.data?.missingFields) {
        errorMessage = `Missing required fields: ${error.response.data.missingFields.join(', ')}`;
      } else {
        errorMessage = error.response?.data?.message || "Failed to submit loan application";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render form based on current step
  const renderStepForm = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="step-form">
            <h3>Step 1: Basic Loan Information</h3>
            <div className="form-group">
              <label>Loan Type</label>
              <input type="text" value={formData.loanType} readOnly className="form-control" />
            </div>
            <div className="form-group">
              <label>Loan Amount (₹)*</label>
              <input 
                type="number" 
                name="loanAmount" 
                value={formData.loanAmount} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter amount between 1,000 and 10,000,000"
              />
            </div>
            <div className="form-group">
              <label>Loan Term (months)*</label>
              <input 
                type="number" 
                name="loanTerm" 
                value={formData.loanTerm} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter term between 6 and 600 months"
              />
            </div>
            <div className="form-group">
              <label>Purpose of Loan*</label>
              <textarea 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Please describe the purpose of this loan in at least 10 characters"
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Interest Rate (%)</label>
              <input type="text" value={formData.interestRate + '%'} readOnly className="form-control" />
            </div>
            <div className="form-group">
              <label>Processing Fee</label>
              <input type="text" value={typeof formData.processingFee === 'number' ? formData.processingFee + '%' : formData.processingFee} readOnly className="form-control" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-form">
            <h3>Step 2: Financial Information</h3>
            <div className="form-group">
              <label>Monthly Income (₹)*</label>
              <input 
                type="number" 
                name="monthlyIncome" 
                value={formData.monthlyIncome} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter monthly income (min 10,000)"
              />
            </div>
            <div className="form-group">
              <label>Annual Income (₹)*</label>
              <input 
                type="number" 
                name="annualIncome" 
                value={formData.annualIncome} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter annual income (min 120,000)"
              />
            </div>
            <div className="form-group">
              <label>Other Income (₹)</label>
              <input 
                type="number" 
                name="otherIncome" 
                value={formData.otherIncome} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter other income if any"
              />
            </div>
            <div className="form-group">
              <label>Total Monthly Expenses (₹)</label>
              <input 
                type="number" 
                name="totalMonthlyExpenses" 
                value={formData.totalMonthlyExpenses} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter total monthly expenses"
              />
            </div>
            <div className="form-group">
              <label>Existing Loans</label>
              <select 
                name="existingLoans" 
                value={formData.existingLoans} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.existingLoans === "Yes" && (
              <div className="form-group">
                <label>Existing EMI Amount (₹)</label>
                <input 
                  type="number" 
                  name="existingEMI" 
                  value={formData.existingEMI} 
                  onChange={handleChange} 
                  className="form-control"
                  placeholder="Enter total EMI amount of existing loans"
                />
              </div>
            )}
            <div className="form-group">
              <label>Credit Score*</label>
              <input 
                type="number" 
                name="creditScore" 
                value={formData.creditScore} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter credit score (300-900)"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-form">
            <h3>Step 3: Applicant Information</h3>
            <div className="form-group">
              <label>First Name*</label>
              <input 
                type="text" 
                name="applicantDetails.firstName" 
                value={formData.applicantDetails.firstName} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input 
                type="text" 
                name="applicantDetails.middleName" 
                value={formData.applicantDetails.middleName} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter middle name (if any)"
              />
            </div>
            <div className="form-group">
              <label>Last Name*</label>
              <input 
                type="text" 
                name="applicantDetails.lastName" 
                value={formData.applicantDetails.lastName} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter last name"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth*</label>
              <input 
                type="date" 
                name="applicantDetails.dateOfBirth" 
                value={formData.applicantDetails.dateOfBirth} 
                onChange={handleChange} 
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select 
                name="applicantDetails.gender" 
                value={formData.applicantDetails.gender} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Marital Status</label>
              <select 
                name="applicantDetails.maritalStatus" 
                value={formData.applicantDetails.maritalStatus} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number*</label>
              <input 
                type="text" 
                name="applicantDetails.phone" 
                value={formData.applicantDetails.phone} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter 10-digit phone number"
              />
            </div>
            <div className="form-group">
              <label>Email*</label>
              <input 
                type="email" 
                name="applicantDetails.email" 
                value={formData.applicantDetails.email} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter email address"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-form">
            <h3>Step 4: Employment Information</h3>
            <div className="form-group">
              <label>Employment Type</label>
              <select 
                name="employmentType" 
                value={formData.employmentType} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Business">Business</option>
                <option value="Government">Government</option>
                <option value="Retired">Retired</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <div className="form-group">
              <label>Employer Name*</label>
              <input 
                type="text" 
                name="employmentDetails.employerName" 
                value={formData.employmentDetails.employerName} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter employer name"
              />
            </div>
            <div className="form-group">
              <label>Position/Designation*</label>
              <input 
                type="text" 
                name="employmentDetails.position" 
                value={formData.employmentDetails.position} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter your position"
              />
            </div>
            <div className="form-group">
              <label>Years at Current Employer*</label>
              <input 
                type="number" 
                name="employmentDetails.yearsAtCurrentEmployer" 
                value={formData.employmentDetails.yearsAtCurrentEmployer} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter years at current employer"
              />
            </div>
            <div className="form-group">
              <label>Monthly Salary (₹)</label>
              <input 
                type="number" 
                name="employmentDetails.monthlySalary" 
                value={formData.employmentDetails.monthlySalary} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter monthly salary"
              />
            </div>
            <div className="form-group">
              <label>Sector</label>
              <select 
                name="employmentDetails.sector" 
                value={formData.employmentDetails.sector} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Banking/Finance">Banking/Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-form">
            <h3>Step 5: Residence Information</h3>
            <div className="form-group">
              <label>Residential Status</label>
              <select 
                name="residentialStatus" 
                value={formData.residentialStatus} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Owned">Owned</option>
                <option value="Rented">Rented</option>
                <option value="Parental">Living with Parents</option>
                <option value="Company Provided">Company Provided</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address Line 1*</label>
              <input 
                type="text" 
                name="residentialAddress.addressLine1" 
                value={formData.residentialAddress.addressLine1} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter address line 1"
              />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input 
                type="text" 
                name="residentialAddress.addressLine2" 
                value={formData.residentialAddress.addressLine2} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter address line 2 (optional)"
              />
            </div>
            <div className="form-group">
              <label>City*</label>
              <input 
                type="text" 
                name="residentialAddress.city" 
                value={formData.residentialAddress.city} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State*</label>
              <input 
                type="text" 
                name="residentialAddress.state" 
                value={formData.residentialAddress.state} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>Postal Code*</label>
              <input 
                type="text" 
                name="residentialAddress.postalCode" 
                value={formData.residentialAddress.postalCode} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter 6-digit postal code"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input 
                type="text" 
                name="residentialAddress.country" 
                value={formData.residentialAddress.country} 
                onChange={handleChange} 
                className="form-control"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Years at Current Address*</label>
              <input 
                type="number" 
                name="yearsAtCurrentAddress" 
                value={formData.yearsAtCurrentAddress} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter years at current address"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-form">
            <h3>Step 6: Bank Details & Finalize</h3>
            <div className="form-group">
              <label>Account Number*</label>
              <input 
                type="text" 
                name="bankDetails.accountNumber" 
                value={formData.bankDetails.accountNumber} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter 9-18 digit account number"
              />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select 
                name="bankDetails.accountType" 
                value={formData.bankDetails.accountType} 
                onChange={handleChange} 
                className="form-control"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bank Name*</label>
              <input 
                type="text" 
                name="bankDetails.bankName" 
                value={formData.bankDetails.bankName} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter bank name"
              />
            </div>
            <div className="form-group">
              <label>IFSC Code*</label>
              <input 
                type="text" 
                name="bankDetails.ifscCode" 
                value={formData.bankDetails.ifscCode} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter IFSC code (e.g., HDFC0001234)"
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name*</label>
              <input 
                type="text" 
                name="bankDetails.accountHolderName" 
                value={formData.bankDetails.accountHolderName} 
                onChange={handleChange} 
                className="form-control"
                placeholder="Enter account holder name"
              />
            </div>
            <div className="form-group">
              <label>Do you want to add a Co-Applicant?</label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="coApplicant" 
                    value="true" 
                    checked={formData.coApplicant === true} 
                    onChange={handleCoApplicantToggle} 
                  /> Yes
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="coApplicant" 
                    value="false" 
                    checked={formData.coApplicant === false} 
                    onChange={handleCoApplicantToggle} 
                  /> No
                </label>
              </div>
            </div>
            {formData.coApplicant && (
              <div className="co-applicant-details">
                <h4>Co-Applicant Details</h4>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="coApplicantDetails.fullName" 
                    value={formData.coApplicantDetails.fullName} 
                    onChange={handleChange} 
                    className="form-control"
                    placeholder="Enter co-applicant's full name"
                  />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <input 
                    type="text" 
                    name="coApplicantDetails.relationship" 
                    value={formData.coApplicantDetails.relationship} 
                    onChange={handleChange} 
                    className="form-control"
                    placeholder="Enter relationship with co-applicant"
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Income</label>
                  <input 
                    type="number" 
                    name="coApplicantDetails.monthlyIncome" 
                    value={formData.coApplicantDetails.monthlyIncome} 
                    onChange={handleChange} 
                    className="form-control"
                    placeholder="Enter co-applicant's monthly income"
                  />
                </div>
              </div>
            )}
            <div className="terms-agreement">
              <label>
                <input type="checkbox" name="termsAccepted" /> I agree to the terms and conditions and confirm that the information provided is accurate
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render the step indicators
  const renderStepIndicators = () => {
    return (
      <div className="step-indicators">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div 
            key={index} 
            className={`step-indicator ${currentStep >= index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    );
  };
  
  // Check if data is still loading
  if (!user) {
    return <div className="loading-container"><div className="loader"></div></div>;
  }

  return (
    <div className="apply-loan-container">
      <ToastContainer position="top-right" autoClose={5000} />
      <h2>Apply for {formData.loanType}</h2>
      <p className="loan-description">
        {selectedLoanType?.description || "Apply for a loan that suits your needs."}
      </p>
      <div className="loan-details-summary">
        <div className="detail">
          <span>Interest Rate:</span> {formData.interestRate}%
        </div>
        <div className="detail">
          <span>Max Amount:</span> ₹{selectedLoanType?.maxAmount?.toLocaleString() || "1,000,000"}
        </div>
        <div className="detail">
          <span>Tenure:</span> {selectedLoanType?.tenure || "12-60 months"}
        </div>
        <div className="detail">
          <span>Processing Fee:</span> {formData.processingFee}
        </div>
      </div>

      {renderStepIndicators()}

      <form onSubmit={handleSubmit} className="loan-application-form">
        {renderStepForm()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => handleStepNavigation("prev")}
              disabled={isLoading}
            >
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => handleStepNavigation("next")}
              disabled={isLoading}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .apply-loan-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .loan-description {
          color: #7f8c8d;
          margin-bottom: 20px;
        }

        .loan-details-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .detail {
          flex: 1 1 200px;
        }

        .detail span {
          font-weight: bold;
          color: #2c3e50;
        }

        .step-indicators {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        .step-indicator {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background-color: #ecf0f1;
          color: #7f8c8d;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 5px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .step-indicator.active {
          background-color: #3498db;
          color: white;
        }

        .loan-application-form {
          margin-top: 20px;
        }

        .step-form {
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .radio-group {
          display: flex;
          gap: 15px;
        }

        .radio-group label {
          display: flex;
          align-items: center;
          font-weight: normal;
        }

        .radio-group input {
          margin-right: 5px;
        }

        .co-applicant-details {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-top: 10px;
        }

        .terms-agreement {
          margin: 20px 0;
        }

        .form-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #7f8c8d;
        }

        .btn-success {
          background-color: #2ecc71;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #27ae60;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApplyLoan;
