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
