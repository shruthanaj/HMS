// Basic validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^\+?[\d\s-()]{10,}$/;
  return re.test(phone);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  // Basic sanitization - remove potentially dangerous characters
  return input.replace(/[<>&"']/g, '');
}

function validateDate(date) {
  return !isNaN(Date.parse(date));
}

module.exports = {
  validateEmail,
  validatePhone,
  sanitizeInput,
  validateDate
};