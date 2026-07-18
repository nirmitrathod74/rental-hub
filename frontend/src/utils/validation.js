export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePhone = (phone, required = false) => {
  if (!phone && required) return 'Phone number is required';
  if (!phone) return '';
  // Basic validation for 10 digit numbers, optionally with country code
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  if (!phoneRegex.test(phone.replace(/\s+/g, ''))) return 'Please enter a valid 10-digit phone number';
  return '';
};

export const validateGST = (gst, required = true) => {
  if (!gst && required) return 'GST number is required';
  if (!gst) return '';
  // Indian GST format: 22AAAAA0000A1Z5
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  if (!gstRegex.test(gst)) return 'Please enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5)';
  return '';
};

export const validatePassword = (password, required = true) => {
  if (!password && required) return 'Password is required';
  if (password && password.length < 8) return 'Password must be at least 8 characters long';
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return '';
};

export const validateCardNumber = (number) => {
  if (!number) return 'Card number is required';
  const cleanNumber = number.replace(/\s+/g, '');
  if (!/^\d{16}$/.test(cleanNumber)) return 'Please enter a valid 16-digit card number';
  return '';
};

export const validateExpiry = (expiry) => {
  if (!expiry) return 'Expiry date is required';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return 'Please enter a valid expiry date (MM/YY)';
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  if (expiryDate < new Date()) return 'Card has expired';
  return '';
};

export const validateCvv = (cvv) => {
  if (!cvv) return 'CVV is required';
  if (!/^\d{3,4}$/.test(cvv)) return 'Please enter a valid 3 or 4-digit CVV';
  return '';
};
