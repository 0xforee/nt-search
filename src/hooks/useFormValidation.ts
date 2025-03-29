import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    message: string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback((name: string, value: any): string => {
    const fieldRules = rules[name];
    if (!fieldRules) return '';

    if (fieldRules.required && !value) {
      return fieldRules.message;
    }

    if (value) {
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        return `${fieldRules.message} (minimum ${fieldRules.minLength} characters)`;
      }

      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        return `${fieldRules.message} (maximum ${fieldRules.maxLength} characters)`;
      }

      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        return fieldRules.message;
      }

      if (fieldRules.custom && !fieldRules.custom(value)) {
        return fieldRules.message;
      }
    }

    return '';
  }, [rules]);

  const validateForm = useCallback((values: { [key: string]: any }): boolean => {
    const newErrors: ValidationErrors = {};
    let hasErrors = false;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    return !hasErrors;
  }, [rules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
  };
}; 