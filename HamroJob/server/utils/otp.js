// Create a Map to store OTP data temporarily
const otpStore = new Map();

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export { otpStore, generateOTP };