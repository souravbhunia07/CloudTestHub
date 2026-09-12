import fs from 'fs';
import path from 'path';

import { uploadFile } from './s3';

// Recursively collect every file inside a directory.
function getFilesRecursively(directory: string): string[] {
  // Read all files and directories inside the current directory.
  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  // Store the discovered files from this directory tree.
  const files: string[] = [];

  // Process every entry found in the directory.
  for (const entry of entries) {
    // Build the absolute path of the current entry.
    const fullPath = path.join(directory, entry.name);

    // Recursively inspect nested directories.
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else {
      // Add files to the collection for later upload.
      files.push(fullPath);
    }
  }

  return files;
}

// Upload all Playwright artifacts belonging to one test run.
export async function uploadRunArtifacts(
  runId: string
): Promise<void> {
  // Locate Playwright's generated test-results directory.
  const resultsDirectory = path.resolve(
    process.cwd(),
    'test-results'
  );

  // Stop execution when no test artifacts were generated.
  if (!fs.existsSync(resultsDirectory)) {
    throw new Error(
      `Test results directory not found: ${resultsDirectory}`
    );
  }

  // Find every generated artifact recursively.
  const files = getFilesRecursively(resultsDirectory);

  // Upload every artifact using the test run as its S3 namespace.
  for (const filePath of files) {
    // Calculate the path relative to the test-results directory.
    const relativePath = path.relative(
      resultsDirectory,
      filePath
    );

    // Normalize Windows paths so S3 receives forward slashes.
    const s3RelativePath = relativePath.replace(/\\/g, '/');

    // Build a unique S3 location for this test execution.
    const s3Key = `test-runs/${runId}/${s3RelativePath}`;

    // Upload the artifact to the CloudTestHub S3 bucket.
    await uploadFile(filePath, s3Key);
  }

  // Report the total number of uploaded artifacts.
  console.log(
    `Uploaded ${files.length} artifacts for run ${runId}`
  );
}