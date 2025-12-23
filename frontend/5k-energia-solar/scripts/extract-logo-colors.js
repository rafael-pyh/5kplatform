const getColors = require('get-image-colors');
const tinycolor = require('tinycolor2');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', '5klogo.png');

getColors(imgPath).then(colors => {
  const hexes = colors.map(c => c.hex());
  // pick first three dominant colors and generate lighter variants
  const picked = hexes.slice(0, 3);
  const lightened = picked.map(h => tinycolor(h).lighten(18).toHexString());

  console.log(JSON.stringify({ extracted: picked, lightened }, null, 2));
}).catch(err => {
  console.error('Error extracting palette:', err);
  process.exit(1);
});
