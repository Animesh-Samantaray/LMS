import React, { useEffect, useRef, useState } from 'react';

const GlobalFrameBackground = () => {
  const imageRef = useRef(null);
  
  // Cache for images
  const imagesRef = useRef([]);
  const totalFrames = 300;

  useEffect(() => {
    // 1. Preload frames progressively
    const preloadProgressively = async () => {
      const loadSingleFrame = (i) => {
        return new Promise((resolve) => {
          const img = new Image();
          const paddedIndex = String(i).padStart(6, '0');
          img.onload = () => {
            imagesRef.current[i] = img;
            resolve();
          };
          img.onerror = () => {
            imagesRef.current[i] = img; // store it anyway so we don't crash
            resolve();
          };
          img.src = `/frames/frame_${paddedIndex}.jpg`;
        });
      };

      // Load frame 1 (index 0) first
      await loadSingleFrame(0);
      
      // Set the initial frame immediately once loaded
      if (imageRef.current && imagesRef.current[0]) {
        imageRef.current.src = imagesRef.current[0].src;
      }

      // Then preload the rest progressively
      for (let i = 1; i < totalFrames; i++) {
        await loadSingleFrame(i);
      }
    };
    
    preloadProgressively();

    // 3. Scroll handler
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateFrame();
          ticking = false;
        });
        ticking = true;
      }
    };

    const updateFrame = () => {
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      
      let progress = 0;
      if (maxScroll > 0) {
        progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      }

      const frameIndex = Math.round(progress * (totalFrames - 1));

      // Render the nearest loaded frame if the exact one isn't ready
      let renderIndex = frameIndex;
      if (!imagesRef.current[renderIndex] || !imagesRef.current[renderIndex].complete) {
        // Fallback to nearest loaded
        let offset = 1;
        while (offset < totalFrames) {
          if (renderIndex - offset >= 0 && imagesRef.current[renderIndex - offset]?.complete) {
            renderIndex = renderIndex - offset;
            break;
          }
          if (renderIndex + offset < totalFrames && imagesRef.current[renderIndex + offset]?.complete) {
            renderIndex = renderIndex + offset;
            break;
          }
          offset++;
        }
      }

      const imgToRender = imagesRef.current[renderIndex];
      if (imgToRender && imgToRender.complete && imageRef.current) {
        imageRef.current.src = imgToRender.src;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Call once to ensure correct initial state
    updateFrame();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div 
      className="global-scroll-animation" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100vh', 
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      <img 
        ref={imageRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
        alt="Background Frame"
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}></div>
      
    </div>
  );
};

export default GlobalFrameBackground;
