import confetti from 'canvas-confetti';

export function triggerLevelUpConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#10B981', '#38BDF8', '#F59E0B'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#38BDF8', '#6366F1', '#A855F7'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#F59E0B', '#10B981', '#38BDF8'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#E11D48', '#F59E0B', '#10B981'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#38BDF8', '#10B981'],
  });
}

export function triggerStreakCelebration() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#F59E0B', '#EF4444', '#F97316'],
    zIndex: 9999,
  });
}
