
import React, { useEffect, useState } from 'react';

interface HeroBackgroundProps {
  backgroundImage?: string;
  mousePos: { x: number; y: number };
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ backgroundImage, mousePos }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Parallax calculations
  const bgTransform = `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px) scale(1.1)`;
  const shapeTransform1 = `translateX(${mousePos.x * 10}px) skewX(-25deg)`;
  const shapeTransform2 = `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px) skewY(15deg)`;

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
      
      {/* 1. Base Layer: Solid Dark with Gradient or Custom Image */}
      <div 
          className="absolute inset-0 bg-zinc-950 bg-gradient-to-br from-black via-zinc-900 to-blue-950 transition-transform duration-100 ease-out will-change-transform"
          style={{ 
              transform: bgTransform,
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
          }} 
      />
      
      {/* 2. Abstract Geometry Shapes (DanMachi Blue/White theme) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {/* Left Blue Beam */}
           <div 
              className="absolute -left-[10%] -top-[10%] w-[50vw] h-[150vh] bg-blue-900/40 transform -skew-x-[25deg] mix-blend-overlay opacity-80 animate-in slide-in-from-left duration-1000 will-change-transform" 
              style={{ transform: shapeTransform1 }}
           />
           {/* Vertical Slices */}
           <div className="absolute left-[30%] top-0 w-[5vw] h-[100vh] bg-black/50 transform -skew-x-[25deg]" />
           <div className="absolute left-[35%] top-0 w-[2vw] h-[100vh] bg-white/10 transform -skew-x-[25deg]" />
           
           {/* Bottom Right Structure */}
           <div 
              className="absolute -right-[10%] bottom-0 w-[60vw] h-[80vh] bg-zinc-900 transform skew-y-[15deg] border-t-4 border-blue-600 opacity-95 animate-in slide-in-from-bottom duration-1000 delay-300 will-change-transform" 
              style={{ transform: shapeTransform2 }}
           />
      </div>

      {/* 3. Texture Overlays */}
      <div className="absolute inset-0 bg-halftone-blue opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      
      {/* 4. Animated Particles (Mana/Excelia) */}
      <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute animate-float" style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  opacity: 0.3 + Math.random() * 0.4
              }}>
                  <div className="w-1 h-1 bg-white rounded-full opacity-80 shadow-[0_0_10px_white]" />
              </div>
          ))}
      </div>

      {/* 5. UI Decor Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute bottom-10 left-10 hidden md:block">
          <div className="flex flex-col gap-1 opacity-40">
              <div className="w-32 h-1 bg-white/20" />
              <div className="w-24 h-1 bg-white/20" />
              <div className="w-16 h-1 bg-white/20" />
          </div>
      </div>
    </div>
  );
};
