const fs = require('fs');
const path = require('path');

// Load the current Archiver ZIP class from the backend dependencies.
const { ZipArchive } = require(
  path.resolve(__dirname, '..', 'backend', 'node_modules', 'archiver')
);

// Read the Lambda package directory and output ZIP path from command-line arguments.
const packageDir = path.resolve(process.argv[2]);
const outputFile = path.resolve(process.argv[3]);

// Create the output stream that will receive the ZIP archive.
const output = fs.createWriteStream(outputFile);

// Create a ZIP archive using maximum compression.
const archive = new ZipArchive({
  zlib: { level: 9 }
});

// Report archive creation errors immediately.
archive.on('error', (error) => {
  throw error;
});

// Confirm that the ZIP file was completely written.
output.on('close', () => {
  console.log(`ZIP created: ${outputFile}`);
  console.log(`ZIP size: ${archive.pointer()} bytes`);
});

// Connect the archive to the output ZIP file.
archive.pipe(output);

// Add the complete Lambda package directory to the archive.
archive.directory(packageDir, false);

// Finalize the ZIP archive.
archive.finalize();