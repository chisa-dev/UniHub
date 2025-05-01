"use client";
import React, { useState, useEffect } from 'react';

interface TextAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TextAnimation: React.FC<TextAnimationProps> = ({ 
  text, 
  speed = 20, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text.charAt(index));
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!completed) {
      setCompleted(true);
      if (onComplete) onComplete();
    }
  }, [index, text, speed, completed, onComplete]);

  return <span>{displayedText}</span>;
};

export default TextAnimation; 