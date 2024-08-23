import * as core from '@actions/core'
import * as junit2json from 'junit2json'

import { readFile } from './files'

export type TestCase = junit2json.TestCase
export type TestSuite = junit2json.TestSuite

/**
 * Extracts test suites from JUnit XML files
 * @param reportFiles - An array of file paths.
 */
export const parseJunitTestSuites = async (
  reportFiles: string[]
): Promise<TestSuite[]> => {
  core.info(`Parsing JUnit XML files: ${reportFiles.join(', ')}`)
  const testSuites: TestSuite[] = []
  for (const file of reportFiles) {
    const fileContent = readFile(file)
    core.debug(`Parsing JUnit XML file: ${file}\n${fileContent}\n\n---`)
    core.info(`Parsing JUnit XML file: ${file}\n${fileContent}\n\n---`)

    const junit = await junit2json.parse(fileContent)
    if (!junit) {
      throw new Error(`Failed to parse JUnit XML file: ${file}`)
    }

    if ('testsuite' in junit) {
      testSuites.push(...(junit.testsuite || []))
    } else if ('testcase' in junit && junit.testcase) {
      testSuites.push(junit)
    } else {
      throw new Error(
        `Failed to get testcases from JUnit XML file: ${file}\n${JSON.stringify(junit)}`
      )
    }
  }
  return testSuites
}
