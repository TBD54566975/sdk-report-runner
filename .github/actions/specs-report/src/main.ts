import * as core from '@actions/core'
import { readActionInputs } from './action-inputs'
import { getFiles } from './files'
import { buildTestVectorReport, TestVectorReport } from './test-vectors'
import { generateSummary } from './summary-report'
import { addCommentToPr } from './pr-comment'

/**
 * The main function for the action.
 */
export async function run(): Promise<void> {
  try {
    const {
      junitReportPaths,
      specPath,
      testCasesPrefix,
      gitToken,
      commentOnPr,
      failOnMissingVectors,
      failOnFailedTestCases
    } = readActionInputs()

    const reportFiles = await getFiles(junitReportPaths)

    const report = await buildTestVectorReport(
      specPath,
      reportFiles,
      testCasesPrefix
    )

    const summary = generateSummary(report)

    if (commentOnPr) {
      await addCommentToPr(summary, gitToken)
    }

    setJobStatus(report, failOnMissingVectors, failOnFailedTestCases)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * Sets the job status based on the test vector results.
 * @param testVectorResults - The test vector report object
 * @param failOnMissingVectors - Whether to fail the job if missing test vectors are found
 * @param failOnFailedTestCases - Whether to fail the job if failed test cases are found
 */
const setJobStatus = (
  testVectorResults: TestVectorReport,
  failOnMissingVectors: boolean,
  failOnFailedTestCases: boolean
): void => {
  if (testVectorResults.specFailedTestCases > 0 && failOnFailedTestCases) {
    core.setFailed('❌ Failed test vectors found')
  } else if (
    testVectorResults.missingVectors.length > 0 &&
    failOnMissingVectors
  ) {
    core.setFailed('❌ Missing test vectors found')
  } else {
    if (testVectorResults.specSkippedTestCases > 0) {
      core.warning('⚠️ Skipped test vectors found')
    }
    core.setOutput('success', 'true')
    core.info('✅ All test vectors passed')
  }
}
