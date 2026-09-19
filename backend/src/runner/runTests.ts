import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import { createTestRun } from '../database/createTestRun';
import { updateTestRun } from '../database/dynamodb';
import { parsePlaywrightResults } from './parseResults';
import { uploadRunArtifacts } from '../storage/uploadRunArtifacts';

// Remove artifacts from previous executions so every run starts clean.
function cleanTestResults(): void {
  // Locate Playwright's local artifact directory.
  const resultsDirectory = path.resolve(process.cwd(), 'test-results');

  // Delete artifacts from the previous execution.
  fs.rmSync(resultsDirectory, {
    recursive: true,
    force: true
  });

  // Recreate the directory for the next execution.
  fs.mkdirSync(resultsDirectory, {
    recursive: true
  });

  // Confirm that cleanup completed.
  console.log('Cleaned previous test artifacts.');
}

// Execute Playwright for an existing CloudTestHub run.
export async function executeTestRun(
  runId: string,
  projectId: string
): Promise<void> {
  // Record when the actual test execution starts.
  const executionStart = Date.now();

  try {
    // Mark the existing test run as actively executing.
    await updateTestRun(runId, {
      status: 'RUNNING'
    });

    // Remove artifacts from previous local executions.
    cleanTestResults();

    // Execute Playwright directly through Node without shell interpolation.
    const playwright = spawn(
      process.execPath,
      [
        path.resolve(
          process.cwd(),
          'node_modules',
          'playwright',
          'cli.js'
        ),
        'test'
      ],
      {
        cwd: process.cwd(),
        stdio: 'inherit'
      }
    );

    // Wait until the Playwright process finishes.
    const exitCode = await new Promise<number>((resolve, reject) => {
      // Handle errors that prevent Playwright from starting.
      playwright.once('error', reject);

      // Return the final Playwright exit code.
      playwright.once('close', (code) => {
        resolve(code ?? 1);
      });
    });

    // Calculate how long the test execution took.
    const duration = Date.now() - executionStart;

    // Parse Playwright's generated JSON report.
    const results = parsePlaywrightResults();

    // Mark the run based on Playwright's exit code.
    const status = exitCode === 0 ? 'PASSED' : 'FAILED';

    // Store the final execution state in DynamoDB.
    await updateTestRun(runId, {
      status,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      finishedAt: new Date().toISOString(),
      duration
    });

    // Upload reports, screenshots, videos, traces, and other artifacts.
    await uploadRunArtifacts(runId);

    // Print the final execution summary.
    console.log(
      `Test run ${runId}: ` +
      `${results.passed} passed, ` +
      `${results.failed} failed, ` +
      `${results.skipped} skipped`
    );

    // Throw after persistence and artifact upload so SQS keeps failed jobs for retry.
    if (exitCode !== 0) {
      // Prevent the SQS worker from deleting the failed message.
      throw new Error(`Playwright execution failed for run ${runId}`);
    }
  } catch (error) {
    // Only update DynamoDB here when an unexpected infrastructure or runner error occurs.
    const duration = Date.now() - executionStart;

    // Check whether the failure happened before Playwright produced its final result.
    const message = error instanceof Error ? error.message : String(error);

    if (!message.startsWith('Playwright execution failed for run')) {
      // Mark unexpected execution errors as failed.
      await updateTestRun(runId, {
        status: 'FAILED',
        finishedAt: new Date().toISOString(),
        duration
      });
    }

    // Log the failure for debugging and CI.
    console.error(`Test run ${runId} failed:`, error);

    // Propagate the error so the SQS worker knows processing failed.
    throw error;
  }
}

// Create a run manually when this module is executed directly for testing.
async function main(): Promise<void> {
  // Create a demo test-run record for standalone runner testing.
  const run = await createTestRun('demo-project');

  // Execute the newly created test run.
  await executeTestRun(run.runId, run.projectId);
}

// Keep direct execution available for backward-compatible local testing.
if (require.main === module) {
  main().catch((error) => {
    // Report standalone runner failures.
    console.error('Test runner failed:', error);

    // Return a non-zero exit code when execution fails.
    process.exit(1);
  });
}