'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F0FFF0' }}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/juhannus2025.png"
          alt="Juhannus 2025 Forest Background"
          fill
          className="object-cover opacity-60"
          priority
        />
      </div>

      {/* Animated Forest Canopy Overlay */}
      <div className="absolute inset-0 z-10">
        {/* Floating leaves animation */}
        <div className="floating-leaves">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="leaf"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 6}s`
              }}
            >
              🍃
            </div>
          ))}
        </div>

        {/* Swaying branches */}
        <div className="branch-overlay">
          <div className="branch branch-left">🌿</div>
          <div className="branch branch-right">🌿</div>
        </div>

        {/* Golden particles (fireflies) */}
        <div className="fireflies">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="firefly"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Hero Title */}
        <div className="mb-8 animate-fade-in">
          <h1 
            className="text-6xl md:text-8xl font-bold mb-4 text-shadow-lg"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              background: 'linear-gradient(135deg, #228B22, #32CD32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Juhannus
          </h1>
          <h2 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: 'Fredoka One, cursive',
              color: '#DAA520'
            }}
          >
            2025
          </h2>
        </div>

        {/* Welcome Message */}
        <div className="mb-12 max-w-2xl">
          <p 
            className="text-xl md:text-2xl mb-4 leading-relaxed"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F',
              textShadow: '0 2px 4px rgba(255,255,255,0.8)'
            }}
          >
            Tervetuloa juhannuksen sydämeen
          </p>
          <p 
            className="text-lg md:text-xl opacity-90"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: '#2F4F4F',
              textShadow: '0 2px 4px rgba(255,255,255,0.8)'
            }}
          >
            Juhlistamme kesän kirkkainta yötä perinteisten leikkien ja yhteisön voimin
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Sign In Button */}
          <button
            onClick={() => setShowAuthOptions(!showAuthOptions)}
            className="forest-button forest-button-primary px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
            style={{
              fontFamily: 'Nunito, sans-serif',
              backgroundColor: '#228B22',
              color: '#F0FFF0',
              border: '2px solid #32CD32'
            }}
          >
            🌲 Kirjaudu
          </button>

          {/* Explore Button */}
          <Link href="/dashboard">
            <button
              className="forest-button forest-button-secondary px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg"
              style={{
                fontFamily: 'Nunito, sans-serif',
                backgroundColor: 'rgba(218, 165, 32, 0.9)',
                color: '#2F4F4F',
                border: '2px solid #DAA520'
              }}
            >
              🍄 Tutustu Juhlaan
            </button>
          </Link>
        </div>

        {/* Auth Options Dropdown */}
        {showAuthOptions && (
          <div className="animate-slide-down bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signin">
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Kirjaudu sisään
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Rekisteröidy
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Preview of Activities */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
          {[
            { icon: '🎯', name: 'Tikka', desc: 'Perinteinen' },
            { icon: '⛳', name: 'Putting', desc: 'Tarkkuutta' },
            { icon: '🎳', name: 'Mölkky', desc: 'Klassikko' },
            { icon: '📸', name: 'Kuvat', desc: 'Muistoja' }
          ].map((activity, i) => (
            <div
              key={i}
              className="activity-preview bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg"
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            >
              <div className="text-3xl mb-2">{activity.icon}</div>
              <h3 
                className="font-bold text-lg"
                style={{ fontFamily: 'Fredoka One, cursive', color: '#228B22' }}
              >
                {activity.name}
              </h3>
              <p 
                className="text-sm opacity-75"
                style={{ fontFamily: 'Nunito, sans-serif', color: '#2F4F4F' }}
              >
                {activity.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .floating-leaves {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .leaf {
          position: absolute;
          font-size: 1.5rem;
          animation: float linear infinite;
          opacity: 0.7;
        }

        @keyframes float {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .branch-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .branch {
          position: absolute;
          font-size: 4rem;
          animation: sway 4s ease-in-out infinite;
        }

        .branch-left {
          top: 10%;
          left: 5%;
          transform-origin: bottom center;
        }

        .branch-right {
          top: 20%;
          right: 5%;
          transform-origin: bottom center;
          animation-delay: -2s;
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .fireflies {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .firefly {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #DAA520;
          border-radius: 50%;
          box-shadow: 0 0 10px #DAA520, 0 0 20px #DAA520;
          animation: twinkle 3s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        .animate-fade-in {
          animation: fadeIn 2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .activity-preview {
          animation: slideUp 0.8s ease-out both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .forest-button {
          transition: all 0.3s ease;
        }

        .forest-button:hover {
          box-shadow: 0 8px 25px rgba(34, 139, 34, 0.3);
        }

        .text-shadow-lg {
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}