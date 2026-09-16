class FrameLoader {
  constructor() {
    this.cache = new Map();
    this.totalFrames = 300;
    this.loading = false;
    this.listeners = new Set();
  }

  generateFrameUrl(index) {
    const padded = String(index).padStart(6, '0');
    return `/frames/frame_${padded}.jpg`;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(index) {
    this.listeners.forEach(listener => listener(index));
  }

  getFrame(index) {
    return this.cache.get(index) || null;
  }

  async loadFrame(index) {
    if (this.cache.has(index)) {
      return this.cache.get(index);
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = this.generateFrameUrl(index);
      
      img.onload = () => {
        this.cache.set(index, img);
        this.notifyListeners(index);
        resolve(img);
      };
      
      img.onerror = () => {
        // Resolve with null to avoid hanging, but don't cache
        console.warn(`Failed to load frame ${index}: ${url}`);
        resolve(null);
      };
      
      img.src = url;
    });
  }

  async preloadProgressively() {
    if (this.loading) return;
    this.loading = true;

    // High priority: Load first frame immediately so hero is visible
    await this.loadFrame(0);

    // Progressive loading for the rest
    for (let i = 1; i < this.totalFrames; i++) {
      await this.loadFrame(i);
      // We can also let the scroll handler request specific priority frames
    }
    
    this.loading = false;
  }
}

export const frameLoader = new FrameLoader();
