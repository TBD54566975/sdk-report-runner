import * as core from '@actions/core'

import { TestVector, TestVectorReport } from './test-vectors'

const SUMMARY_HEADER = 'TBD Spec Test Vectors Report'

/**
 * Generates the summary markdown report for the test vector results.
 */
export const generateSummary = (testVectorReport: TestVectorReport): string => {
  core.info(
    `Generating summary... ${JSON.stringify(testVectorReport, null, 2)}`
  )
  core.summary.addHeading(SUMMARY_HEADER, 2)

  addOverallStatsTable(testVectorReport)

  const parentDir = process.cwd().split('/').pop() || ''
  addFailedVectorsSection(testVectorReport.failedVectors, parentDir)
  addMissingVectorsSection(testVectorReport.missingVectors)
  addSkippedVectorsSection(testVectorReport.skippedVectors, parentDir)

  addFooterInfo()

  return setSummaryOutputs(testVectorReport)
}

const setSummaryOutputs = (testVectorReport: TestVectorReport): string => {
  // Set outputs for other workflow steps to use
  const summary = core.summary.stringify()
  core.info(`Generated report summary:\n${summary}`)
  core.setOutput('summary', summary)
  core.setOutput(
    'test-vector-report',
    JSON.stringify(testVectorReport, null, 2)
  )

  core.summary.write()

  return summary
}

const addOverallStatsTable = (testVectorReport: TestVectorReport): void => {
  // Create overall statistics table
  const overallStatsTable = [
    [
      { data: 'Total Test Vectors', header: true },
      { data: 'Total Test Cases', header: true },
      { data: '✅ Passed', header: true },
      { data: '❌ Failed', header: true },
      { data: '⚠️ Skipped', header: true }
    ],
    [
      `${testVectorReport.totalTestVectors}`,
      `${testVectorReport.specTestCases}`,
      `${testVectorReport.specPassedTestCases}`,
      `${testVectorReport.specFailedTestCases}`,
      `${testVectorReport.specSkippedTestCases}`
    ]
  ]
  core.info(
    `Overall stats table: ${JSON.stringify(overallStatsTable, null, 2)}`
  )
  core.summary.addTable(overallStatsTable)

  const success = testVectorReport.successVectors.length
  const total = testVectorReport.totalTestVectors
  const hasIssues = success !== total
  if (!hasIssues) {
    core.summary.addRaw('✅ All test vectors passed')
  } else {
    core.summary.addRaw(
      `ℹ️ ${success} out of ${total} test vectors passed successfully.`
    )
  }
}

const addFailedVectorsSection = (
  failedVectors: TestVector[],
  parentDir: string
): void => {
  if (failedVectors.length > 0) {
    core.summary.addHeading(`❌ Failed Vectors (${failedVectors.length})`, 3)
    core.summary.addRaw('These are test vectors with test cases that failed.')
    for (const vector of failedVectors) {
      core.info(`Failed vector: ${JSON.stringify(vector, null, 2)}`)
      core.summary.addHeading(`${vector.category}: ${vector.name}`, 4)
      const relativeFilePath = vector.file.replace(parentDir, '')
      core.summary.addRaw(`File: ${relativeFilePath}\n\n`)

      const failedTestsHeaderRow = [
        { data: 'Test Case', header: true },
        { data: 'Failure Message', header: true }
      ]
      const failedTestsRows = vector.testCases
        .filter(testCase => testCase.failure)
        .map(testCase => [
          testCase.name ?? 'Unnamed test',
          failureToMessageRows(testCase.failure ?? [])
        ])
      core.summary.addTable([failedTestsHeaderRow, ...failedTestsRows])
    }
  }
}

const addMissingVectorsSection = (missingVectors: TestVector[]): void => {
  if (missingVectors.length > 0) {
    core.info(`Missing vectors: ${JSON.stringify(missingVectors, null, 2)}`)
    core.summary.addHeading(`❌ Missing Vectors (${missingVectors.length})`, 3)
    core.summary.addRaw('These are test vectors without any test cases.')
    const missingVectorsTable = [
      [
        { data: 'Category', header: true },
        { data: 'Name', header: true }
      ],
      ...missingVectors.map(vector => [vector.category, vector.name])
    ]
    core.summary.addTable(missingVectorsTable)
  }
}

const addSkippedVectorsSection = (
  skippedVectors: TestVector[],
  parentDir: string
): void => {
  if (skippedVectors.length > 0) {
    core.summary.addHeading(`⚠️ Skipped Vectors (${skippedVectors.length})`, 3)
    core.summary.addRaw(
      'These are test vectors with test cases that are set to skip.'
    )
    for (const vector of skippedVectors) {
      core.summary.addHeading(`${vector.category}: ${vector.name}`, 3)
      const relativeFilePath = vector.file.replace(parentDir, '')
      core.summary.addRaw(`<code>File: ${relativeFilePath}</code>\n\n`)

      const skippedTests = vector.testCases
        .filter(testCase => testCase.skipped)
        .map(testCase => [testCase.name ?? 'Unnamed test'])
      const skippedTestsTable = [
        [{ data: 'Test Case', header: true }],
        ...skippedTests
      ]
      core.summary.addTable(skippedTestsTable)
    }
  }
}

/** Add footer with timestamp and automation info */
const addFooterInfo = (): void => {
  core.summary.addSeparator()
  core.summary.addRaw(
    `<em>Automatically generated at: ${new Date().toISOString()}</em>`
  )
}

/**
 * Converts the failure object to a markdown string.
 * @param failure - A list of failure details
 * @returns The failure message prepared for markdown
 */
const failureToMessageRows = (
  failure: {
    inner?: string
    message?: string
  }[]
): string => {
  if (!failure?.length) return 'Unknown failure'

  return failure
    .map(detail => {
      const escapedInnerHTML = detail.inner
        ?.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
      return `<b>${detail.message}</b><br/><pre>${
        escapedInnerHTML || 'Unknown error'
      }\n</pre>`
    })
    .join('<br>\n')
}
