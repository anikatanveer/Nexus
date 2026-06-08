import React, { useRef, useEffect } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface TwoFactorVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => void;
  onCancel: () => void;
  otpMessage?: string;
  otpVisibleCode?: string;
  isLoading?: boolean;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  onVerify,
  onResend,
  onCancel,
  otpMessage,
  otpVisibleCode,
  isLoading = false
}) => {
  const [otp, setOtp] = React.useState<string[]>(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [resendTimer, setResendTimer] = React.useState(0);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      await onVerify(otpCode);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    onResend();
    setOtp(['', '', '', '', '', '']);
    setError(null);
    setResendTimer(30);
    inputs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary-100 rounded-full">
            <ShieldCheck size={32} className="text-primary-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to {email}
        </p>

        {otpMessage && (
          <p className="text-sm text-primary-600 text-center mb-4">
            {otpMessage}
          </p>
        )}

        {otpVisibleCode && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-700">Dev code:</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{otpVisibleCode}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Verification Code
            </label>
            <div className="flex gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleVerify}
              fullWidth
              isLoading={isLoading}
              disabled={otp.join('').length !== 6 || isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Verify
            </Button>
            <Button
              onClick={onCancel}
              fullWidth
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive a code?{' '}
              {resendTimer > 0 ? (
                <span className="text-gray-500">Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  disabled={isLoading}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <strong>Demo Mode:</strong> Use any 6-digit code (e.g., 123456)
          </p>
        </div>
      </div>
    </div>
  );
};
