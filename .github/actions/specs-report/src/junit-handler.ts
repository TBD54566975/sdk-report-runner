import {
  parse as parseJunit,
  TestCase as JunitTestCase,
  TestSuites as JunitTestSuites
} from 'junit2json'

import { readFile } from './files'

export type TestCase = JunitTestCase
export type TestSuites = JunitTestSuites

/**
 * Parses the JUnit XML files
 * @param reportFiles - An array of file paths.
 */
export const parseJunitTestCases = async (
  reportFiles: string[]
): Promise<TestCase[]> => {
  const junitTestCases: TestCase[] = []
  for (const file of reportFiles) {
    const fileContent = readFile(file)

    const junit = await parseJunit(fileContent)
    if (!junit) {
      throw new Error(`Failed to parse JUnit XML file: ${file}`)
    }

    if ('testsuite' in junit) {
      const testCases =
        junit.testsuite?.flatMap(testSuite => testSuite.testcase || []) || []
      junitTestCases.push(...testCases)
    } else if ('testcase' in junit && junit.testcase) {
      junitTestCases.push(...junit.testcase)
    } else {
      throw new Error(
        `Failed to get testcases from JUnit XML file: ${file}\n${JSON.stringify(junit)}`
      )
    }
  }
  return junitTestCases
}
