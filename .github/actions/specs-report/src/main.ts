import * as core from '@actions/core'
import { ActionInputs, readActionInputs } from './action-inputs'
import { getFiles } from './files'
import { buildTestVectorReport, TestVectorReport } from './test-vectors'
import { generateSummary } from './summary-report'
import { handleSdkRelease, handleSpecRelease } from './spec-release'
import { addCommentToPr } from './pr-comment'

/**
 * The main function for the action.
 */
export async function run(): Promise<void> {
  try {
    const inputs = readActionInputs()
    const { releaseMode } = inputs

    if (releaseMode === 'none') {
      await handleDefaultReport(inputs)
    } else if (releaseMode === 'spec') {
      await handleSpecRelease(inputs)
    } else if (releaseMode === 'sdk') {
      await handleSdkRelease(inputs)
    } else {
      throw new Error('Unknown release mode')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

const handleDefaultReport = async (inputs: ActionInputs): Promise<void> => {
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

  setJobStatus(report, failOnMissingVectors, failOnFailedTestCases)
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
