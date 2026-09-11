// Define the information CloudTestHub stores for every test execution.
export interface TestRun {
  runId: string;
  projectId: string;
  status: 'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED';
  startedAt: string;
  finishedAt?: string;
  passed?: number;
  failed?: number;
  skipped?: number;
  duration?: number;
}