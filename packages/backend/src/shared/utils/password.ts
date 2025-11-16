import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }

  if (!hasUpperCase) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }

  if (!hasLowerCase) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }

  if (!hasNumber) {
    return { valid: false, message: "Password must contain at least one number" };
  }

  if (!hasSpecialChar) {
    return { valid: false, message: "Password must contain at least one special character" };
  }

  return { valid: true, message: "Password is strong" };
};
