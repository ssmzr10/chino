import React, { useState, useEffect, useCallback } from 'react';
import { Coffee, Delete, Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { AuthRole } from '../types';

export const PIN_ROLE_MAP: Record<string, AuthRole> = {
  '1111': 'waiter1',
  '2222': 'waiter2',
  '3333': 'waiter3',
  '4444': 'dishwasher',
  '0330': 'manager',
};

export const ROLE_TITLES: Record<AuthRole, { title: string; subtitle: string; iconEmoji: string }> = {
  waiter1: {
    title: 'سالندار اول',
    subtitle: 'دسترسی به وظایف روزانه و برنامه هفتگی شیفت',
    iconEmoji: '☕',
  },
  waiter2: {
    title: 'سالندار دوم',
    subtitle: 'دسترسی به وظایف روزانه و برنامه هفتگی شیفت',
    iconEmoji: '☕',
  },
  waiter3: {
    title: 'سالندار سوم',
    subtitle: 'دسترسی به وظایف روزانه و برنامه هفتگی شیفت',
    iconEmoji: '☕',
  },
  dishwasher: {
    title: 'ظرفشور',
    subtitle: 'دسترسی به وظایف روزانه و برنامه هفتگی شیفت',
    iconEmoji: '🍽️',
  },
  manager: {
    title: 'مدیریت کافه',
    subtitle: 'دسترسی کامل به موجودی، تسک‌ها، رسپی‌ها و گزارش‌ها',
    iconEmoji: '👑',
  },
};

export const SESSION_STORAGE_AUTH_KEY = 'cafe_chino_session_role';

interface PinLoginScreenProps {
  onLoginSuccess: (role: AuthRole) => void;
}

export const PinLoginScreen: React.FC<PinLoginScreenProps> = ({ onLoginSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyPin = useCallback((pinToTest: string) => {
    const matchedRole = PIN_ROLE_MAP[pinToTest];
    if (matchedRole) {
      setErrorMessage(null);
      try {
        sessionStorage.setItem(SESSION_STORAGE_AUTH_KEY, matchedRole);
      } catch (e) {
        console.error('Failed to save to sessionStorage', e);
      }
      onLoginSuccess(matchedRole);
    } else {
      setIsShaking(true);
      setErrorMessage('رمز اشتباه است');
      setPin('');
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [onLoginSuccess]);

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage(null);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length === 4) {
      verifyPin(pin);
    } else if (pin.length > 0) {
      setIsShaking(true);
      setErrorMessage('لطفاً رمز ۴ رقمی را کامل وارد کنید');
      setTimeout(() => setIsShaking(false), 450);
    }
  };

  // Enable physical keyboard entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, verifyPin]);

  return (
    <div 
      className="min-h-screen bg-[#FAF8F5] text-[#201A19] flex flex-col items-center justify-center p-4 selection:bg-[#FADCD2]"
      dir="rtl"
    >
      <div 
        className={`w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 border border-[#EFEBE9] shadow-[0_8px_32px_rgba(62,39,35,0.06)] flex flex-col items-center transition-all ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Café Logo & Title */}
        <div className="w-16 h-16 rounded-3xl bg-[#3E2723] text-[#FAF8F5] flex items-center justify-center shadow-lg shadow-[#3E2723]/15 mb-3">
          <Coffee className="w-8 h-8 text-[#FADCD2]" />
        </div>

        <h1 className="font-extrabold text-2xl text-[#201A19] tracking-tight">
          کافه چینو
        </h1>
        <p className="text-xs text-[#8D6E63] font-medium mt-1 mb-6 text-center">
          ورود به سامانه مدیریت شیفت و کنترل کارها
        </p>

        {/* 4-Pin Dots Indicator */}
        <div className="w-full bg-[#F5F2EC] rounded-2xl py-4 px-6 mb-3 border border-[#E6DFD5] flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-4 py-1" dir="ltr">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-[#3E2723] scale-110 shadow-xs'
                      : 'bg-white border-2 border-[#D7CCC8]'
                  }`}
                />
              );
            })}
          </div>

          <div className="h-5 mt-2 flex items-center justify-center">
            {errorMessage ? (
              <span className="text-xs text-[#BA1A1A] font-bold flex items-center gap-1 animate-fadeIn">
                <ShieldAlert className="w-3.5 h-3.5" />
                {errorMessage}
              </span>
            ) : (
              <span className="text-[11px] text-[#A1887F] font-medium flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#A1887F]" />
                پین‌کد ۴ رقمی نقش خود را وارد کنید
              </span>
            )}
          </div>
        </div>

        {/* Touch Keypad */}
        <div className="w-full grid grid-cols-3 gap-2.5 my-2" dir="ltr">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-14 bg-[#FAF8F5] hover:bg-[#F3EBE7] active:bg-[#3E2723] active:text-white text-[#201A19] font-extrabold text-xl rounded-2xl border border-[#E6DFD5] shadow-xs active:scale-95 transition-all flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          {/* Row 4: Clear / 0 / Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 bg-white hover:bg-[#F5F2EC] active:scale-95 text-[#BA1A1A] text-xs font-bold rounded-2xl border border-[#E6DFD5] transition-all flex items-center justify-center"
            title="پاک کردن"
          >
            پاک کردن
          </button>

          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-14 bg-[#FAF8F5] hover:bg-[#F3EBE7] active:bg-[#3E2723] active:text-white text-[#201A19] font-extrabold text-xl rounded-2xl border border-[#E6DFD5] shadow-xs active:scale-95 transition-all flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 bg-white hover:bg-[#F5F2EC] active:scale-95 text-[#6F5A52] rounded-2xl border border-[#E6DFD5] transition-all flex items-center justify-center"
            title="حذف رقم قبلی"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Enter Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={pin.length !== 4}
          className={`w-full h-12 mt-2 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
            pin.length === 4
              ? 'bg-[#3E2723] hover:bg-[#201A19] text-white shadow-md shadow-[#3E2723]/20 active:scale-[0.99]'
              : 'bg-[#EFEBE9] text-[#A1887F] cursor-not-allowed'
          }`}
        >
          <span>ورود به سیستم</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
