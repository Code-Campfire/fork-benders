export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');

    return { isValid: errors.length === 0, errors };
};

export const getPasswordStrength = (password) => {
    const score = [
        password.length >= 8,
        password.length >= 12,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ].filter(Boolean).length;

    if (score <= 2) return { strength: 'weak', color: 'red' };
    if (score <= 4) return { strength: 'medium', color: 'yellow' };
    return { strength: 'strong', color: 'green' };
};
