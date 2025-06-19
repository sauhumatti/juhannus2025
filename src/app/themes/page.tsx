'use client';

import { useState } from 'react';

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState('');

  // Juhannus-themed color palettes
  const themes = [
    {
      name: 'Midsummer Classic',
      id: 'midsummer-classic',
      description: 'Traditional Juhannus colors with white nights and golden sunshine',
      colors: {
        primary: '#FFD700', // Gold
        secondary: '#87CEEB', // Sky blue
        accent: '#228B22', // Forest green
        background: '#F8F8FF', // Ghost white
        text: '#2F4F4F' // Dark slate gray
      },
      font: 'serif'
    },
    {
      name: 'Forest Folklore',
      id: 'forest-folklore',
      description: 'Deep forest greens with mystical Finnish nature vibes',
      colors: {
        primary: '#228B22', // Forest green
        secondary: '#32CD32', // Lime green
        accent: '#DAA520', // Goldenrod
        background: '#F0FFF0', // Honeydew
        text: '#2F4F4F' // Dark slate gray
      },
      font: 'rustic'
    },
    {
      name: 'Midnight Sun',
      id: 'midnight-sun',
      description: 'Bright and airy with the endless light of Finnish summer',
      colors: {
        primary: '#FFA500', // Orange
        secondary: '#FFE4B5', // Moccasin
        accent: '#FF6347', // Tomato
        background: '#FFFAF0', // Floral white
        text: '#8B4513' // Saddle brown
      },
      font: 'modern'
    },
    {
      name: 'Bonfire Celebration',
      id: 'bonfire-celebration',
      description: 'Warm fire colors for the traditional Juhannus kokko',
      colors: {
        primary: '#DC143C', // Crimson
        secondary: '#FF4500', // Orange red
        accent: '#FFD700', // Gold
        background: '#FFF8DC', // Cornsilk
        text: '#8B0000' // Dark red
      },
      font: 'bold'
    },
    {
      name: 'Lake Reflection',
      id: 'lake-reflection',
      description: 'Cool blues and whites inspired by Finnish lakes',
      colors: {
        primary: '#4169E1', // Royal blue
        secondary: '#87CEFA', // Light sky blue
        accent: '#B0C4DE', // Light steel blue
        background: '#F0F8FF', // Alice blue
        text: '#191970' // Midnight blue
      },
      font: 'clean'
    },
    {
      name: 'Birch & Berries',
      id: 'birch-berries',
      description: 'White birch with summer berry accents',
      colors: {
        primary: '#FFFFFF', // White
        secondary: '#DC143C', // Crimson
        accent: '#9370DB', // Medium purple
        background: '#F5F5F5', // White smoke
        text: '#2F2F2F' // Dark gray
      },
      font: 'elegant'
    }
  ];

  // Font suggestions for each style
  const fontStyles = {
    serif: {
      primary: 'Playfair Display',
      secondary: 'Georgia',
      description: 'Classic serif fonts with Finnish elegance'
    },
    rustic: {
      primary: 'Fredoka One',
      secondary: 'Nunito',
      description: 'Playful, hand-crafted feel for folklore vibes'
    },
    modern: {
      primary: 'Poppins',
      secondary: 'Inter',
      description: 'Clean, contemporary fonts for bright summer feeling'
    },
    bold: {
      primary: 'Oswald',
      secondary: 'Roboto',
      description: 'Strong, impactful fonts for celebration energy'
    },
    clean: {
      primary: 'Lato',
      secondary: 'Source Sans Pro',
      description: 'Crisp, readable fonts like clear lake water'
    },
    elegant: {
      primary: 'Dancing Script',
      secondary: 'Crimson Text',
      description: 'Graceful fonts inspired by birch tree elegance'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Juhannus 2025 Theme Selection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a theme that captures the magic of Finnish Midsummer celebration. 
            Each theme includes carefully selected colors and fonts inspired by Juhannus traditions.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedTheme === theme.id
                  ? 'border-blue-500 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              style={{ backgroundColor: theme.colors.background }}
              onClick={() => setSelectedTheme(theme.id)}
            >
              <div className="absolute top-4 right-4">
                {selectedTheme === theme.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>

              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: theme.colors.text }}
              >
                {theme.name}
              </h3>
              
              <p 
                className="text-sm mb-4 opacity-80"
                style={{ color: theme.colors.text }}
              >
                {theme.description}
              </p>

              {/* Color palette preview */}
              <div className="flex space-x-2 mb-4">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary color"
                />
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.colors.secondary }}
                  title="Secondary color"
                />
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent color"
                />
              </div>

              {/* Font info */}
              <div className="text-xs opacity-75" style={{ color: theme.colors.text }}>
                <strong>Fonts:</strong> {fontStyles[theme.font as keyof typeof fontStyles].primary} + {fontStyles[theme.font as keyof typeof fontStyles].secondary}
              </div>

              {/* Sample text */}
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}>
                <p className="text-sm font-semibold">Juhannus 2025</p>
                <p className="text-xs opacity-90">Midsummer Magic</p>
              </div>
            </div>
          ))}
        </div>

        {selectedTheme && (
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Selected Theme: {themes.find(t => t.id === selectedTheme)?.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Color details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Color Palette</h3>
                {Object.entries(themes.find(t => t.id === selectedTheme)?.colors || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-sm font-mono text-gray-500">{value}</span>
                  </div>
                ))}
              </div>

              {/* Font details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Typography</h3>
                {(() => {
                  const theme = themes.find(t => t.id === selectedTheme);
                  const fontInfo = theme ? fontStyles[theme.font as keyof typeof fontStyles] : null;
                  return fontInfo ? (
                    <div>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">Primary Font</p>
                        <p className="text-lg" style={{ fontFamily: fontInfo.primary }}>{fontInfo.primary}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700">Secondary Font</p>
                        <p className="text-base" style={{ fontFamily: fontInfo.secondary }}>{fontInfo.secondary}</p>
                      </div>
                      <p className="text-sm text-gray-600">{fontInfo.description}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next steps:</strong> Copy the color values and font names to implement this theme in your CSS or design system.
                Consider adding these Google Fonts to your project for the typography.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Juhannus Celebration
          </a>
        </div>
      </div>
    </div>
  );
}