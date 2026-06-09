const Jimp = require('jimp');

async function removeBackground() {
  try {
    const image = await Jimp.read('anna_sitting.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // 1. Mask for background
    const bgMask = new Array(width * height).fill(false);
    const queue = [];
    
    function addQueue(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = (y * width + x);
      if (bgMask[idx]) return;
      
      const pIdx = idx * 4;
      const r = image.bitmap.data[pIdx];
      const g = image.bitmap.data[pIdx+1];
      const b = image.bitmap.data[pIdx+2];
      
      // Background is considered any light color (white, light gray, light cyan background)
      // Since it's a white background originally, we check for high brightness
      if (r > 230 && g > 230 && b > 230) {
        bgMask[idx] = true;
        queue.push({x, y});
      }
    }
    
    // Start flood fill from edges
    for (let x=0; x<width; x++) { addQueue(x, 0); addQueue(x, height-1); }
    for (let y=0; y<height; y++) { addQueue(0, y); addQueue(width-1, y); }
    
    while(queue.length > 0) {
      const {x, y} = queue.shift();
      addQueue(x+1, y);
      addQueue(x-1, y);
      addQueue(x, y+1);
      addQueue(x, y-1);
    }
    
    // 2. Expand mask slightly to catch anti-aliasing halos (dilate)
    const haloMask = new Array(width * height).fill(false);
    const edgeMask = new Array(width * height).fill(false);
    
    for (let y=1; y<height-1; y++) {
      for (let x=1; x<width-1; x++) {
        const idx = y * width + x;
        if (!bgMask[idx]) {
          // If a neighbor is bgMask, this is an edge
          if (bgMask[idx-1] || bgMask[idx+1] || bgMask[idx-width] || bgMask[idx+width]) {
            edgeMask[idx] = true;
          }
        }
      }
    }
    
    // 3. Apply changes
    image.scan(0, 0, width, height, function(x, y, idx) {
      const mIdx = y * width + x;
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx+1];
      const b = this.bitmap.data[idx+2];
      const brightness = (r + g + b) / 3;
      
      if (bgMask[mIdx]) {
        this.bitmap.data[idx+3] = 0; // Fully transparent
      } 
      else if (edgeMask[mIdx]) {
        // If it's an edge pixel and it's bright (like white or bright cyan), fade and darken it
        if (brightness > 100) {
          // Fade alpha based on brightness
          this.bitmap.data[idx+3] = Math.max(0, 255 - (brightness - 100) * 1.5);
          // Darken color
          this.bitmap.data[idx] = r * 0.4;
          this.bitmap.data[idx+1] = g * 0.4;
          this.bitmap.data[idx+2] = b * 0.4;
        }
      } else {
        // Global pass to kill stray cyan/white halos that flood fill missed
        // Check for bright cyan/white
        if (brightness > 180 && g > 150 && b > 150) {
           // Darken stray bright rim lights
           this.bitmap.data[idx+3] = Math.max(0, 255 - (brightness - 150));
           this.bitmap.data[idx] = r * 0.5;
           this.bitmap.data[idx+1] = g * 0.5;
           this.bitmap.data[idx+2] = b * 0.5;
        }
      }
    });

    await image.writeAsync('anna_sitting.png');
    console.log('Background and cyan halo removed via Flood Fill successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

removeBackground();
