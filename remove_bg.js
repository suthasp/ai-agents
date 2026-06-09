const Jimp = require('jimp');

async function removeBackground() {
  try {
    const image = await Jimp.read('anna_sitting.png');
    
    // Define the tolerance for what is considered "white"
    const distanceTolerance = 10; // Out of 255
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very close to pure white, make it transparent
      if (red >= 240 && green >= 240 && blue >= 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel
      }
    });

    await image.writeAsync('anna_sitting.png');
    console.log('Background removed successfully.');
  } catch (err) {
    console.error('Error:', err);
  }
}

removeBackground();
