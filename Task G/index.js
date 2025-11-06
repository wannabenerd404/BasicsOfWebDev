document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const tableBody = document.querySelector('#registrationTable tbody');

    // Group related input and error elements for easier access
    const formElements = {
        timestamp: { input: document.getElementById('timestamp') },
        fullName: { input: document.getElementById('fullName'), error: document.getElementById('fullNameError') },
        email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
        phone: { input: document.getElementById('phone'), error: document.getElementById('phoneError') },
        birthDate: { input: document.getElementById('birthDate'), error: document.getElementById('birthDateError') },
        terms: { input: document.getElementById('terms'), error: document.getElementById('termsError') }
    };

    // Helper functions for error display
    const showError = (element, message) => {
        element.textContent = message;
        element.style.display = 'block';
    };

    const hideError = (element) => {
        element.textContent = '';
        element.style.display = 'none';
    };

    // Validation rules defined as an object
    const validationRules = {
        fullName: (name) => {
            if (!name) return 'Please enter your full name.';
            const words = name.trim().split(/\s+/);
            if (words.length < 2) return 'Full name must contain at least two words.';
            if (words.some(word => word.length < 2)) return 'Each word in your name must be at least 2 characters long.';
            return ''; // Empty string means valid
        },
        email: (email) => {
            if (!email) return 'Please enter your email address.';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return 'Please enter a valid email format (e.g., example@domain.com).';
            return '';
        },
        phone: (phone) => {
            if (!phone) return 'Please enter your phone number.';
            const phoneRegex = /^\+358\d{9,10}$|^\+358-\d{2}-\d{7,8}$/;
            if (!phoneRegex.test(phone)) return 'Please enter a valid Finnish phone number, e.g., +358401234567 or +358-40-1234567.';
            return '';
        },
        birthDate: (dateString) => {
            if (!dateString) return 'Please select your birth date.';
            const birthDate = new Date(dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (birthDate > today) return 'Birth date cannot be in the future.';

            const minAgeDate = new Date();
            minAgeDate.setFullYear(minAgeDate.getFullYear() - 13); // Minimum 13 years old
            if (birthDate > minAgeDate) return 'You must be at least 13 years old.';
            return '';
        },
        terms: (isChecked) => {
            if (!isChecked) return 'You must accept the terms and conditions.';
            return '';
        }
    };

    // Generic validation function that loops through rules
    const validateField = (fieldKey) => {
        const { input, error } = formElements[fieldKey];
        const value = fieldKey === 'terms' ? input.checked : input.value;
        
        hideError(error); // Always hide before re-validating

        const errorMessage = validationRules[fieldKey](value);
        if (errorMessage) {
            showError(error, errorMessage);
            return false;
        }
        return true;
    };

    // Add real-time validation listeners
    // Iterating through formElements to attach event listeners
    for (const key in formElements) {
        if (formElements[key].input && formElements[key].error) { // Only attach to fields with errors
            const eventType = key === 'birthDate' || key === 'terms' ? 'change' : 'input';
            formElements[key].input.addEventListener(eventType, () => validateField(key));
        }
    }


    // Form submission handler
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        let formIsValid = true;
        const submittedValues = {};

        // Perform all validations and collect values
        for (const key in validationRules) { // Only validate fields that have rules
            if (!validateField(key)) {
                formIsValid = false;
            }
            // Collect the value after validation (valid or not)
            submittedValues[key] = key === 'terms' ? formElements[key].input.checked : formElements[key].input.value;
        }

        if (formIsValid) {
            // Auto-fill timestamp
            const now = new Date();
            const timestampValue = now.toLocaleString();
            formElements.timestamp.input.value = timestampValue; // Update hidden input

            // Create a new table row
            const newRow = tableBody.insertRow();

            // Define the order of columns in the table
            const columnOrder = ['timestamp', 'fullName', 'email', 'phone', 'birthDate', 'terms'];

            columnOrder.forEach(key => {
                let cellValue;
                if (key === 'timestamp') {
                    cellValue = timestampValue; // Use the formatted timestamp
                } else if (key === 'terms') {
                    cellValue = submittedValues[key] ? 'Yes' : 'No';
                } else {
                    cellValue = submittedValues[key];
                }
                newRow.insertCell().textContent = cellValue;
            });

            // Clear the form and hide error messages
            form.reset();
            for (const key in formElements) {
                if (formElements[key].error) { // Only hide errors for fields that have them
                    hideError(formElements[key].error);
                }
            }
        }
    });
});
