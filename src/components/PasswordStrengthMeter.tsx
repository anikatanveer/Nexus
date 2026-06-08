import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }, [password]);

  const strength = useMemo(() => {
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    if (metRequirements === 0) return { level: 'weak', color: 'bg-error-500', label: 'Weak' };
    if (metRequirements <= 2) return { level: 'fair', color: 'bg-warning-500', label: 'Fair' };
    if (metRequirements <= 3) return { level: 'good', color: 'bg-blue-500', label: 'Good' };
    return { level: 'strong', color: 'bg-success-500', label: 'Strong' };
  }, [requirements]);

  const getStrengthPercentage = () => {
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    return (metRequirements / 5) * 100;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Password Strength</label>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            strength.level === 'weak' ? 'bg-error-100 text-error-700' :
            strength.level === 'fair' ? 'bg-warning-100 text-warning-700' :
            strength.level === 'good' ? 'bg-blue-100 text-blue-700' :
            'bg-success-100 text-success-700'
          }`}>
            {strength.label}
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${getStrengthPercentage()}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          {requirements.minLength ? (
            <Check size={16} className="text-success-500 flex-shrink-0" />
          ) : (
            <X size={16} className="text-gray-300 flex-shrink-0" />
          )}
          <span className={requirements.minLength ? 'text-gray-700' : 'text-gray-500'}>
            At least 8 characters
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {requirements.hasUppercase ? (
            <Check size={16} className="text-success-500 flex-shrink-0" />
          ) : (
            <X size={16} className="text-gray-300 flex-shrink-0" />
          )}
          <span className={requirements.hasUppercase ? 'text-gray-700' : 'text-gray-500'}>
            At least one uppercase letter
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {requirements.hasLowercase ? (
            <Check size={16} className="text-success-500 flex-shrink-0" />
          ) : (
            <X size={16} className="text-gray-300 flex-shrink-0" />
          )}
          <span className={requirements.hasLowercase ? 'text-gray-700' : 'text-gray-500'}>
            At least one lowercase letter
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {requirements.hasNumbers ? (
            <Check size={16} className="text-success-500 flex-shrink-0" />
          ) : (
            <X size={16} className="text-gray-300 flex-shrink-0" />
          )}
          <span className={requirements.hasNumbers ? 'text-gray-700' : 'text-gray-500'}>
            At least one number
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {requirements.hasSpecial ? (
            <Check size={16} className="text-success-500 flex-shrink-0" />
          ) : (
            <X size={16} className="text-gray-300 flex-shrink-0" />
          )}
          <span className={requirements.hasSpecial ? 'text-gray-700' : 'text-gray-500'}>
            At least one special character (!@#$%^&*)
          </span>
        </div>
      </div>
    </div>
  );
};
