import * as core from '@actions/core'
import { ActionInputs } from './action-inputs'
import { getFiles } from './files'
import { buildTestVectorReport, TestVectorReport } from './test-vectors'
import { generateSummary } from './summary-report'
import { addCommentToPr } from './pr-comment'

export const handleCIReport = async (inputs: ActionInputs): Promise<void> => {
  const {
    junitReportPaths,
    specPath,
    suiteRegexStrFilters,
    gitToken,
    commentOnPr,
    failOnMissingVectors,
    failOnFailedTestCases
  } = inputs

  const reportFiles = await getFiles(junitReportPaths)

  const report = await buildTestVectorReport(
    specPath,
    reportFiles,
    suiteRegexStrFilters
  )

  const summary = generateSummary(report)

  if (commentOnPr) {
    await addCommentToPr(summary, gitToken)
  }

  setCIJobStatus(report, failOnMissingVectors, failOnFailedTestCases)
}

/**
 * Sets the CI job status based on the test vector results.
 * @param testVectorResults - The test vector report object
 * @param failOnMissingVectors - Whether to fail the job if missing test vectors are found
 * @param failOnFailedTestCases - Whether to fail the job if failed test cases are found
 */
const setCIJobStatus = (
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
