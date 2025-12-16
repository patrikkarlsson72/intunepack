import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');
const svgPath = path.join(iconsDir, 'upload-icon.svg');
const icoPath = path.join(iconsDir, 'icon.ico');

async function createNewIco() {
  if (fs.existsSync(svgPath)) {
    try {
      // Create ICO file with multiple sizes (16, 32, 48, 64, 128, 256)
      const sizes = [16, 32, 48, 64, 128, 256];
      
      // For ICO format, we need to create a multi-resolution file
      // Sharp doesn't directly support ICO output, so we'll create PNG files first
      // and then use a different approach
      
      console.log('Creating PNG files for ICO conversion...');
      
      for (const size of sizes) {
        const pngPath = path.join(iconsDir, `icon_${size}.png`);
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`Created ${size}x${size} PNG`);
      }
      
      // Create a simple ICO using the 256x256 version as the main icon
      const mainIcon = await sharp(svgPath)
        .resize(256, 256)
        .png()
        .toBuffer();
      
      // Write the main icon as a temporary file
      const tempPngPath = path.join(iconsDir, 'temp_icon.png');
      fs.writeFileSync(tempPngPath, mainIcon);
      
      console.log('Created temporary PNG for ICO conversion');
      console.log('Note: You may need to use an online ICO converter or specialized tool');
      console.log('to create the final ICO file from the PNG files.');
      
    } catch (error) {
      console.error('Error creating ICO files:', error.message);
    }
  } else {
    console.log('SVG file not found:', svgPath);
  }
}

createNewIco().catch(console.error);


