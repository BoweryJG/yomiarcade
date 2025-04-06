// Convert SVG files to PNG for better browser compatibility
const svgToPng = (svgFile, width, height) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = svgFile;
  });
};

// Preload all SVG assets and convert to PNG
const preloadAssets = async () => {
  try {
    // Neocis logo
    const neocisLogo = document.getElementById('login-logo');
    const logoImg = await svgToPng('assets/neocis-logo.svg', 150, 45);
    neocisLogo.src = logoImg;
    document.querySelector('header .logo').src = logoImg;
    
    // Method icons
    const freehandIcon = document.getElementById('freehand-icon');
    freehandIcon.src = await svgToPng('assets/freehand-icon.svg', 80, 80);
    
    const staticIcon = document.getElementById('static-icon');
    staticIcon.src = await svgToPng('assets/static-icon.svg', 80, 80);
    
    const yomiIcon = document.getElementById('yomi-icon');
    yomiIcon.src = await svgToPng('assets/yomi-icon.svg', 80, 80);
    
    // Yomi arm
    const yomiArm = document.getElementById('yomi-pulse');
    yomiArm.src = await svgToPng('assets/yomi-arm.svg', 200, 200);
    
    console.log('All assets loaded successfully');
  } catch (error) {
    console.error('Error loading assets:', error);
  }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Preload assets
  preloadAssets();
});
