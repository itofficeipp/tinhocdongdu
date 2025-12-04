
import React, { useEffect, useState } from 'react';
import { BannerConfig } from '../types';

interface FloatingAdsProps {
  config: BannerConfig;
}

export const FloatingAds: React.FC<FloatingAdsProps> = ({ config }) => {
  const [styles, setStyles] = useState<{ isVisible: boolean; top: number }>({ isVisible: true, top: 140 });
  
  // Dimensions
  const BANNER_HEIGHT = 480;
  const MARGIN_BOTTOM = 20;
  const DEFAULT_TOP = 140; // ~140px to clear the header + top bar comfortably

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      const footerSection = document.getElementById('main-footer');
      
      let newTop = DEFAULT_TOP;

      // 1. Check Hero Section to push ads down (Below green frame)
      if (heroSection) {
          const heroRect = heroSection.getBoundingClientRect();
          // heroRect.bottom is the distance from viewport top to hero bottom
          // If the hero bottom is lower than our default start point, push the ads down
          // We add 20px buffer for aesthetics
          if (heroRect.bottom > DEFAULT_TOP - 20) {
              newTop = heroRect.bottom + 20;
          }
      }

      // Ensure we don't start higher than DEFAULT_TOP (sticky header clearance)
      newTop = Math.max(DEFAULT_TOP, newTop);

      // 2. Check Footer Section to stop ads (Collision detection)
      if (footerSection) {
          const footerTop = footerSection.getBoundingClientRect().top;
          const bannerBottomPos = newTop + BANNER_HEIGHT;

          if (footerTop < bannerBottomPos + MARGIN_BOTTOM) {
              const overlap = (bannerBottomPos + MARGIN_BOTTOM) - footerTop;
              newTop = newTop - overlap;
          }
      }

      setStyles({ isVisible: true, top: newTop });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!config.isVisible) return null;

  return (
    <>
      {/* Left Banner */}
      <div 
         className="hidden 2xl:block fixed left-[calc(50%-860px)] w-[240px] z-20 transition-all duration-75 ease-out animate-fade-in-up"
         style={{ top: `${styles.top}px`, height: `${BANNER_HEIGHT}px` }}
      >
        <a href={config.leftLink} className="block w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-100 bg-white hover:scale-[1.02] transition-transform">
          <img 
            src={config.leftImage} 
            alt="Quảng cáo trái" 
            className="w-full h-full object-cover"
          />
        </a>
      </div>

      {/* Right Banner */}
      <div 
         className="hidden 2xl:block fixed right-[calc(50%-860px)] w-[240px] z-20 transition-all duration-75 ease-out animate-fade-in-up"
         style={{ top: `${styles.top}px`, height: `${BANNER_HEIGHT}px` }}
      >
        <a href={config.rightLink} className="block w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-100 bg-white hover:scale-[1.02] transition-transform">
          <img 
            src={config.rightImage} 
            alt="Quảng cáo phải" 
            className="w-full h-full object-cover"
          />
        </a>
      </div>
    </>
  );
};
