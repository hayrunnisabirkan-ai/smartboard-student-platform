import React, { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  onTick?: (remaining: number) => void;
  paused?: boolean;
}

export function Timer({ duration, onTimeUp, onTick, paused = false }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setRemaining(prev => {
        const newValue = prev - 1;
        if (onTick) onTick(newValue);
        if (newValue <= 0) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paused, onTimeUp, onTick]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    const percentage = (remaining / duration) * 100;
    if (percentage > 50) return '#2B5D3A';
    if (percentage > 25) return '#F5A623';
    return '#ef4444';
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
        style={{ backgroundColor: getColor() }}
      >
        {formatTime(remaining)}
      </div>
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${(remaining / duration) * 100}%`,
            backgroundColor: getColor()
          }}
        />
      </div>
    </div>
  );
}

interface CountdownProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

export function Countdown({ seconds, onComplete, className = '' }: CountdownProps) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className={`text-6xl font-bold text-[#2B5D3A] ${className}`}>
      {count}
    </div>
  );
}
