import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, Delete, KeyRound, AlertCircle } from 'lucide-react';
import { hasSavedPin, savePin, verifyPin } from '../utils/pin';
import { ThemeToggle } from './ThemeToggle';

interface PinLockScreenProps {
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const isFirstTime = !hasSavedPin();

  // For first-time setup: step 1 = choose pin, step 2 = confirm pin
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [initialPin, setInitialPin] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const PIN_LENGTH = 4;

  const triggerError = useCallback((message: string) => {
    setError(message);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
    setTimeout(() => {
      setPin('');
    }, 400);
  }, []);

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;
      setError('');

      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === PIN_LENGTH) {
        if (isFirstTime) {
          if (setupStep === 'create') {
            // Move to confirm step
            setTimeout(() => {
              setInitialPin(nextPin);
              setPin('');
              setSetupStep('confirm');
            }, 200);
          } else {
            // Confirming the pin
            if (nextPin === initialPin) {
              const success = savePin(nextPin);
              if (success) {
                onUnlock();
              } else {
                triggerError('Kon de pincode niet opslaan.');
              }
            } else {
              triggerError('De pincodes komen niet overeen. Probeer het opnieuw.');
              setTimeout(() => {
                setSetupStep('create');
                setInitialPin('');
              }, 700);
            }
          }
        } else {
          // Unlocking with existing pin
          setTimeout(() => {
            if (verifyPin(nextPin)) {
              onUnlock();
            } else {
              triggerError('Onjuiste pincode. Probeer het opnieuw.');
            }
          }, 150);
        }
      }
    },
    [pin, isFirstTime, setupStep, initialPin, onUnlock, triggerError]
  );

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setError('');
    }
  }, [pin]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigitPress, handleDelete]);

  return (
    <main
      id="pin-lock-screen"
      role="main"
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#faf7f2] dark:bg-[#19130f] text-[#163f57] dark:text-[#fffdfa] transition-colors select-none"
    >
      {/* Top Bar with theme toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div
        id="pin-lock-card"
        className={`w-full max-w-sm bg-[#ffffff] dark:bg-[#251d18] border border-[#d8cabb] dark:border-[#3e3027] rounded-3xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center transition-all ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Lock Icon */}
        <div
          id="pin-lock-icon-container"
          className="w-14 h-14 rounded-2xl bg-[#f4eee6] dark:bg-[#332720] border border-[#ded3c5] dark:border-[#4d3c32] flex items-center justify-center mb-5 text-[#163f57] dark:text-[#cfa373] shadow-xs"
        >
          {isFirstTime ? (
            <KeyRound className="w-7 h-7 text-[#8a5f2e] dark:text-[#cfa373]" />
          ) : (
            <Lock className="w-7 h-7 text-[#163f57] dark:text-[#cfa373]" />
          )}
        </div>

        {/* Title and Subtitle */}
        <h1 id="pin-lock-title" className="text-xl sm:text-2xl font-bold tracking-tight text-[#163f57] dark:text-[#fffdfa]">
          {isFirstTime
            ? setupStep === 'create'
              ? 'Stel je pincode in'
              : 'Bevestig je pincode'
            : 'Dagboek vergrendeld'}
        </h1>

        <p id="pin-lock-description" className="text-xs sm:text-sm text-[#6b5847] dark:text-[#c9b9a9] mt-2 mb-6 font-medium max-w-xs">
          {isFirstTime
            ? setupStep === 'create'
              ? 'Kies een 4-cijferige pincode om je dagboek-entries veilig te vergrendelen.'
              : 'Voer dezelfde 4-cijferige pincode nogmaals in ter bevestiging.'
            : 'Voer je 4-cijferige pincode in om je dagboek-entries te openen.'}
        </p>

        {/* PIN Indicators (4 Dots) */}
        <div
          id="pin-dots-display"
          className="flex items-center justify-center gap-4 mb-6"
          role="status"
          aria-label={`${pin.length} van de 4 cijfers ingevoerd`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                id={`pin-dot-${index}`}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#163f57] dark:bg-[#cfa373] scale-110 shadow-xs ring-2 ring-[#163f57]/20 dark:ring-[#cfa373]/30'
                    : 'bg-[#ded3c5] dark:bg-[#3e3027] border border-[#c7b7a1] dark:border-[#4d3c32]'
                }`}
              />
            );
          })}
        </div>

        {/* Error Notification */}
        {error ? (
          <div
            id="pin-error-message"
            className="flex items-center gap-1.5 text-xs text-rose-800 dark:text-rose-300 font-semibold mb-4 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="h-7 mb-4 flex items-center justify-center text-xs text-[#8a7767] dark:text-[#a8988a]">
            {isFirstTime && setupStep === 'confirm' ? (
              <span className="flex items-center gap-1 text-[#8a5f2e] dark:text-[#cfa373] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Stap 2 van 2
              </span>
            ) : (
              <span>Toetsenbord of numeriek toetsenpaneel</span>
            )}
          </div>
        )}

        {/* Numeric Keypad */}
        <div id="pin-keypad" className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`keypad-btn-${digit}`}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-14 w-full rounded-2xl bg-[#faf7f2] dark:bg-[#1d1713] hover:bg-[#eae0d2] dark:hover:bg-[#2e231c] active:bg-[#ded1be] dark:active:bg-[#382b22] border border-[#ded3c5] dark:border-[#3e3027] text-xl font-bold text-[#163f57] dark:text-[#fffdfa] transition-all cursor-pointer flex items-center justify-center shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373]"
              aria-label={`Cijfer ${digit}`}
            >
              {digit}
            </button>
          ))}

          {/* Reset / Empty button */}
          <button
            id="keypad-btn-reset"
            type="button"
            onClick={() => {
              setPin('');
              setError('');
              if (isFirstTime && setupStep === 'confirm') {
                setSetupStep('create');
                setInitialPin('');
              }
            }}
            disabled={pin.length === 0 && (!isFirstTime || setupStep === 'create')}
            className="h-14 w-full rounded-2xl bg-transparent hover:bg-[#f4eee6] dark:hover:bg-[#201814] disabled:opacity-0 text-xs font-bold text-[#8a7767] dark:text-[#a8988a] transition-all cursor-pointer flex items-center justify-center"
            aria-label="Invoer wissen"
          >
            {isFirstTime && setupStep === 'confirm' ? 'Opnieuw' : 'Wis'}
          </button>

          {/* Digit 0 */}
          <button
            id="keypad-btn-0"
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-14 w-full rounded-2xl bg-[#faf7f2] dark:bg-[#1d1713] hover:bg-[#eae0d2] dark:hover:bg-[#2e231c] active:bg-[#ded1be] dark:active:bg-[#382b22] border border-[#ded3c5] dark:border-[#3e3027] text-xl font-bold text-[#163f57] dark:text-[#fffdfa] transition-all cursor-pointer flex items-center justify-center shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373]"
            aria-label="Cijfer 0"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            id="keypad-btn-delete"
            type="button"
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="h-14 w-full rounded-2xl bg-[#faf7f2] dark:bg-[#1d1713] hover:bg-[#eae0d2] dark:hover:bg-[#2e231c] active:bg-[#ded1be] dark:active:bg-[#382b22] border border-[#ded3c5] dark:border-[#3e3027] text-[#163f57] dark:text-[#fffdfa] disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#163f57] dark:focus:ring-[#cfa373]"
            aria-label="Laatste cijfer verwijderen"
          >
            <Delete className="w-5 h-5 text-[#8a5f2e] dark:text-[#cfa373]" />
          </button>
        </div>
      </div>
    </main>
  );
};
