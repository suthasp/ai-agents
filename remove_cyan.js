const Jimp = require('jimp');

async function removeCyanHalo() {
  try {
    // Read the already processed image
    const image = await Jimp.read('anna_sitting.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      
      // If it's visible
      if (alpha > 0) {
        // Detect Cyan/Teal/Green rim light
        // Cyan means Green and Blue are significantly higher than Red
        if (g > r + 15 && b > r + 15) {
          // It's cyan/teal! 
          // Let's just make it completely transparent or very dark
          this.bitmap.data[idx + 3] = 0; // Remove it completely
        }
        // Catch green-ish rim lights too
        else if (g > r + 15 && g > b + 15) {
          this.bitmap.data[idx + 3] = 0; 
        }
        // Catch any remaining bright white/gray halo pixels
        else if (r > 150 && g > 150 && b > 150 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20) {
          this.bitmap.data[idx + 3] = 0;
        }
      }
    });

    await image.writeAsync('anna_sitting.png');
    console.log('Cyan rim light removed successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

removeCyanHalo();
