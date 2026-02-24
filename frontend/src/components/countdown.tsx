
'use client';

import { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date('2026-03-23T10:00:00') - +new Date();
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
        <div className="text-4xl md:text-6xl font-bold text-white bg-white/10 p-4 rounded-lg shadow-inner w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
          {String(timeLeft[interval]).padStart(2, '0')}
        </div>
        <div className="mt-2 text-sm md:text-lg font-medium uppercase tracking-wider text-white/80">{interval}</div>
      </div>
    );
  });

  return (
    <div className="flex justify-center space-x-2 md:space-x-8">
      {timerComponents.length ? timerComponents : <span>Event has started!</span>}
    </div>
  );
};

export default Countdown;
