const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('anna_sitting.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    const bgMask = new Array(width * height).fill(false);
    const queue = [];
    
    function addQueue(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = y * width + x;
      if (bgMask[idx]) return;
      
      const pIdx = idx * 4;
      const r = image.bitmap.data[pIdx];
      const g = image.bitmap.data[pIdx+1];
      const b = image.bitmap.data[pIdx+2];
      const a = image.bitmap.data[pIdx+3];
      
      // Treat transparent pixels as background
      if (a < 50) {
        bgMask[idx] = true;
        queue.push({x, y});
      }
      // Treat white/gray outline/background as background
      // Check if pixel is light/white/gray and not pinkish.
      // Pink is high red, high blue, low green.
      else if (r > 180 && g > 180 && b > 180) {
        bgMask[idx] = true;
        queue.push({x, y});
      }
    }
    
    // Seed edges
    for (let x=0; x<width; x++) { addQueue(x, 0); addQueue(x, height-1); }
    for (let y=0; y<height; y++) { addQueue(0, y); addQueue(width-1, y); }
    
    // Expand flood fill
    while(queue.length > 0) {
      const {x, y} = queue.shift();
      addQueue(x+1, y);
      addQueue(x-1, y);
      addQueue(x, y+1);
      addQueue(x, y-1);
    }
    
    // Now make all bgMask pixels transparent and feather edges
    image.scan(0, 0, width, height, function(x, y, idx) {
      const mIdx = y * width + x;
      if (bgMask[mIdx]) {
        this.bitmap.data[idx+3] = 0; // Alpha = 0
      } else {
        // Find if it's an edge of the transparent/white background
        if (x>0 && x<width-1 && y>0 && y<height-1) {
            const isEdge = bgMask[mIdx-1] || bgMask[mIdx+1] || bgMask[mIdx-width] || bgMask[mIdx+width];
            if (isEdge) {
                const r = this.bitmap.data[idx];
                const g = this.bitmap.data[idx+1];
                const b = this.bitmap.data[idx+2];
                const brightness = (r+g+b)/3;
                
                // If the edge is bright (remnant of white outline)
                if (brightness > 120) {
                    this.bitmap.data[idx+3] = 128; // Semi-transparent edge
                    this.bitmap.data[idx] = Math.max(0, r - 80);
                    this.bitmap.data[idx+1] = Math.max(0, g - 80);
                    this.bitmap.data[idx+2] = Math.max(0, b - 80);
                }
            }
        }
      }
    });

    await image.writeAsync('anna_sitting.png');
    console.log('Outline and background removed successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

processImage();
