
import { useState, useEffect } from 'react';
import BuildValidator from '../services/BuildValidator';

export const useBuildValidation = () => {
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    errors: string[];
    readinessScore: number;
    checks: Array<{ name: string; passed: boolean; critical: boolean }>;
  }>({
    isValid: true,
    errors: [],
    readinessScore: 100,
    checks: []
  });

  useEffect(() => {
    const validator = BuildValidator.getInstance();
    
    // Валидируем сборку
    const buildValidation = validator.validateProductionBuild();
    const readinessStatus = validator.getProductionReadinessStatus();
    
    setValidationStatus({
      isValid: buildValidation.isValid,
      errors: buildValidation.errors,
      readinessScore: readinessStatus.score,
      checks: readinessStatus.checks
    });
  }, []);

  return validationStatus;
};
