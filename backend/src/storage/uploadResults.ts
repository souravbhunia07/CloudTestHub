import fs from 'fs';
import path from 'path';

import { uploadFile } from './s3';

// Locate the directory containing Playwright's generated test results.
const RESULTS_DIR = path.resolve(
  process.cwd(),
  'test-results'
);

// Upload all generated test result files to S3.
async function uploadResults(): Promise<void> {

  // Stop execution if Playwright has not generated any results.
  if (!fs.existsSync(RESULTS_DIR)) {
    console.error('test-results directory not found.');
    process.exit(1);
  }

  // Read all files directly inside the test-results directory.
  const files = fs.readdirSync(RESULTS_DIR);

  // Process each generated result file individually.
  for (const file of files) {

    // Build the complete path to the local result file.
    const filePath = path.join(RESULTS_DIR, file);

    // Only upload files and ignore directories for now.
    if (fs.statSync(filePath).isFile()) {

      // Store each result under the latest test-run prefix in S3.
      await uploadFile(
        filePath,
        `test-runs/latest/${file}`
      );
    }
  }
}

// Start uploading and handle any errors from the process.
uploadResults()
  .then(() => {
    console.log('All test results uploaded successfully.');
  })
  .catch((error) => {
    console.error('Upload failed:', error);
    process.exit(1);
  });