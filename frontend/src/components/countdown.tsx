
'use client';

import { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date('2026-03-18T10:00:00') - +new Date();
      let newTimeLeft: { [key: string]: number } = {};

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return newTimeLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timerComponents = Object.keys(timeLeft).map(interval => {
    if (timeLeft[interval] === undefined) {
      return null;
    }

    return (
      <div key={interval} className="flex flex-col items-center">
        <div className="text-2xl md:text-4xl font-bold text-white glass-card p-2 rounded-lg w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          {String(timeLeft[interval]).padStart(2, '0')}
        </div>
        <div className="mt-2 text-[10px] md:text-xs font-medium uppercase tracking-wider text-white/70">{interval}</div>
      </div>
    );
  });

  return (
    <div className="flex justify-center space-x-4 md:space-x-10">
      {timerComponents.length ? timerComponents : <span>Event has started!</span>}
    </div>
  );
};

export default Countdown;
