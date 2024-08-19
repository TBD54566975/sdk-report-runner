import * as core from '@actions/core'

/**
 * Inputs for the action.
 */
export interface ActionInputs {
  /** The paths to the JUnit XML files */
  junitReportPaths: string
  /** The path to the spec files */
  specPath: string
  /** The prefix of the test cases to be filtered */
  testCasesPrefix: string
  /** The GitHub token to use for adding a comment to the PR */
  gitToken: string
  /** Whether to add the report as a comment to the PR */
  commentOnPr: boolean
  /** Whether to fail the job if missing test vectors are found */
  failOnMissingVectors: boolean
  /** Whether to fail the job if failed test cases are found */
  failOnFailedTestCases: boolean
}

/**
 * Reads the inputs for the action.
 * @returns {ActionInputs} The inputs for the action.
 */
export const readActionInputs = (): ActionInputs => {
  const junitReportPaths = core.getInput('junit-report-paths', {
    required: true
  })
  const specPath = core.getInput('spec-path', { required: true })
  const testCasesPrefix = core.getInput('test-cases-prefix')
  const gitToken = core.getInput('git-token')
  const commentOnPr = core.getInput('comment-on-pr') === 'true'
  const failOnMissingVectors =
    core.getInput('fail-on-missing-vectors') === 'true'
  const failOnFailedTestCases =
    core.getInput('fail-on-failed-test-cases') === 'true'
  return {
    junitReportPaths,
    specPath,
    testCasesPrefix,
    gitToken,
    commentOnPr,
    failOnMissingVectors,
    failOnFailedTestCases
  }
}
