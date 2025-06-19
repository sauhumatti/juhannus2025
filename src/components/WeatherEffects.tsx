'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  opacity: number;
  type: string;
}

interface WeatherEffectsProps {
  weatherCondition: string;
  isNight: boolean;
  intensity?: number;
}

export default function WeatherEffects({ 
  weatherCondition, 
  isNight, 
  intensity = 1 
}: WeatherEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize particles based on weather condition
  useEffect(() => {
    let particleCount = 0;
    let particleType = '';
    
    switch (weatherCondition.toLowerCase()) {
      case 'rain':
        particleCount = Math.floor(50 * intensity);
        particleType = 'rain';
        break;
      case 'snow':
        particleCount = Math.floor(30 * intensity);
        particleType = 'snow';
        break;
      case 'clouds':
        particleCount = Math.floor(20 * intensity);
        particleType = 'cloud';
        break;
      case 'clear':
        if (isNight) {
          particleCount = Math.floor(15 * intensity);
          particleType = 'star';
        } else {
          particleCount = Math.floor(10 * intensity);
          particleType = 'sun';
        }
        break;
      default:
        particleCount = 0;
    }

    // Create initial particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle(particleType, i));
    }
    setParticles(newParticles);
  }, [weatherCondition, isNight, intensity]);

  const createParticle = (type: string, index: number): Particle => {
    const baseId = `${type}-${index}-${Date.now()}`;
    
    switch (type) {
      case 'rain':
        return {
          id: baseId,
          x: Math.random() * window.innerWidth,
          y: -10,
          speedX: Math.random() * 2 - 1, // Slight horizontal movement
          speedY: Math.random() * 5 + 8, // Fast downward
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.5,
          type: 'rain'
        };
      case 'snow':
        return {
          id: baseId,
          x: Math.random() * window.innerWidth,
          y: -10,
          speedX: Math.random() * 2 - 1, // Gentle drift
          speedY: Math.random() * 2 + 1, // Slower fall
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.4 + 0.6,
          type: 'snow'
        };
      case 'cloud':
        return {
          id: baseId,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.3,
          speedX: Math.random() * 1 + 0.5, // Slow horizontal drift
          speedY: Math.random() * 0.5 - 0.25,
          size: Math.random() * 20 + 30,
          opacity: Math.random() * 0.3 + 0.1,
          type: 'cloud'
        };
      case 'star':
        return {
          id: baseId,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.5,
          speedX: 0,
          speedY: 0,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          type: 'star'
        };
      case 'sun':
        return {
          id: baseId,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.3,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          size: Math.random() * 3 + 2,
          opacity: Math.random() * 0.4 + 0.2,
          type: 'sun'
        };
      default:
        return {
          id: baseId,
          x: 0,
          y: 0,
          speedX: 0,
          speedY: 0,
          size: 1,
          opacity: 0,
          type: 'none'
        };
    }
  };

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animationInterval = setInterval(() => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          let newOpacity = particle.opacity;

          // Handle different particle behaviors
          switch (particle.type) {
            case 'rain':
              // Reset rain at top when it falls off screen
              if (newY > window.innerHeight) {
                newY = -10;
                newX = Math.random() * window.innerWidth;
              }
              break;
            case 'snow':
              // Reset snow at top, add gentle swaying
              if (newY > window.innerHeight) {
                newY = -10;
                newX = Math.random() * window.innerWidth;
              }
              newX += Math.sin(Date.now() * 0.001 + parseInt(particle.id.split('-')[1])) * 0.5;
              break;
            case 'cloud':
              // Wrap clouds around screen
              if (newX > window.innerWidth + 50) {
                newX = -50;
              }
              break;
            case 'star':
              // Twinkling effect for stars
              newOpacity = 0.2 + Math.abs(Math.sin(Date.now() * 0.002 + parseInt(particle.id.split('-')[1]))) * 0.6;
              break;
            case 'sun':
              // Gentle floating motion for sun particles
              newX += Math.sin(Date.now() * 0.001 + parseInt(particle.id.split('-')[1])) * 0.2;
              newY += Math.cos(Date.now() * 0.0008 + parseInt(particle.id.split('-')[1])) * 0.1;
              newOpacity = 0.1 + Math.abs(Math.sin(Date.now() * 0.001 + parseInt(particle.id.split('-')[1]))) * 0.3;
              break;
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            opacity: newOpacity
          };
        });
      });
    }, 50);

    return () => clearInterval(animationInterval);
  }, [particles.length]);

  const getParticleStyle = (particle: Particle) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      opacity: particle.opacity,
      pointerEvents: 'none' as const,
      zIndex: 1,
    };

    switch (particle.type) {
      case 'rain':
        return {
          ...baseStyle,
          width: `${particle.size}px`,
          height: `${particle.size * 8}px`,
          background: 'linear-gradient(to bottom, rgba(173, 216, 230, 0.8), rgba(135, 206, 235, 0.4))',
          borderRadius: '50%',
          transform: 'rotate(15deg)'
        };
      case 'snow':
        return {
          ...baseStyle,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6))',
          borderRadius: '50%',
          boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)'
        };
      case 'cloud':
        return {
          ...baseStyle,
          width: `${particle.size}px`,
          height: `${particle.size * 0.6}px`,
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.4), rgba(220, 220, 220, 0.2))',
          borderRadius: '50%',
          filter: 'blur(2px)'
        };
      case 'star':
        return {
          ...baseStyle,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          background: 'radial-gradient(circle, rgba(255, 255, 200, 0.9), rgba(255, 255, 150, 0.4))',
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(255, 255, 200, 0.6)'
        };
      case 'sun':
        return {
          ...baseStyle,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6), rgba(255, 165, 0, 0.3))',
          borderRadius: '50%',
          filter: 'blur(1px)'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          style={getParticleStyle(particle)}
        />
      ))}
    </div>
  );
}