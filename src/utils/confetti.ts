import confetti from 'canvas-confetti';

/**
 * Trigger a vibrant celebration confetti animation for elementary book completion
 */
export function triggerCelebrationConfetti() {
  try {
    // 1. Center main burst
    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#fbbf24'],
      zIndex: 99999,
    });

    // 2. Left side cheer
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#fbbf24'],
        zIndex: 99999,
      });
    }, 120);

    // 3. Right side cheer
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#ec4899', '#3b82f6', '#10b981', '#fbbf24'],
        zIndex: 99999,
      });
    }, 220);

    // 4. Golden stars shower
    setTimeout(() => {
      confetti({
        particleCount: 25,
        spread: 100,
        origin: { y: 0.5 },
        shapes: ['star'],
        colors: ['#fbbf24', '#f59e0b', '#ffffff'],
        scalar: 1.2,
        zIndex: 99999,
      });
    }, 350);
  } catch (err) {
    console.debug('Confetti error', err);
  }
}
