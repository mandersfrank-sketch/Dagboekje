const PIN_STORAGE_KEY = 'dagboek_pincode_v1';

export function hasSavedPin(): boolean {
  try {
    const pin = localStorage.getItem(PIN_STORAGE_KEY);
    return Boolean(pin && pin.trim().length >= 4);
  } catch {
    return false;
  }
}

export function savePin(pin: string): boolean {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin.trim());
    return true;
  } catch (err) {
    console.error('Kon pincode niet opslaan:', err);
    return false;
  }
}

export function verifyPin(enteredPin: string): boolean {
  try {
    const saved = localStorage.getItem(PIN_STORAGE_KEY);
    if (!saved) return false;
    return saved.trim() === enteredPin.trim();
  } catch {
    return false;
  }
}
