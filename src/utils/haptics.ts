/**
 * VET SYSTEM — Haptic Feedback Engine for Native Mobile Experience
 * Triggers micro-vibrations on physical button taps for authentic tactile feel.
 */

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function triggerHaptic(type: HapticFeedbackType = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'light':
          navigator.vibrate(12); // Short, sharp tactile tap
          break;
        case 'medium':
          navigator.vibrate(25); // Firm button press
          break;
        case 'heavy':
          navigator.vibrate(40); // Deep physical switch press
          break;
        case 'success':
          navigator.vibrate([15, 40, 20]); // Double micro-pulse
          break;
        case 'warning':
          navigator.vibrate([30, 60, 30]); // Warning buzz
          break;
        case 'error':
          navigator.vibrate([40, 50, 40, 50, 40]); // Triple buzz
          break;
        default:
          navigator.vibrate(12);
      }
    }
  } catch {
    // Gracefully ignore on unsupported devices
  }
}
