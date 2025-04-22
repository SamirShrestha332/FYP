import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { dirname } from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dfplmkziu',
  api_key: '962393579386312',
  api_secret: 'sCvTFErOCkBUZuO8Kk7ITS8sMhQ'
});

// Test the connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Cloudinary connection error:', error);
  } else {
    console.log('Cloudinary connection successful:', result);
    
    // After successful connection, try uploading a test file
    testFileUpload();
  }
});

// Function to test file upload
async function testFileUpload() {
  try {
    // Create a simple text file for testing
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for Cloudinary upload.');
    
    console.log('Test file created at:', testFilePath);
    console.log('Attempting to upload to Cloudinary...');
    
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(testFilePath, {
      folder: 'test',
      resource_type: 'raw'
    });
    
    console.log('Upload successful!');
    console.log('Uploaded file URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Clean up the test file
    fs.unlinkSync(testFilePath);
    console.log('Test file cleaned up');
    
  } catch (error) {
    console.error('Error during file upload test:', error);
  }
}