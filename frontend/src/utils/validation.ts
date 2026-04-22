export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  return { isValid: true };
};