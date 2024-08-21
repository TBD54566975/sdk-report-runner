import * as core from '@actions/core'

import { getFiles, readJsonFile } from './files'
import { parseJunitTestCases, TestCase } from './junit-handler'

export interface TestVector {
  /** The category of the test vector */
  category: string
  /** The name of the test vector */
  name: string
  /** The file path of the test vector */
  file: string
  /** The test cases of the test vector */
  testCases: TestCase[]
}

export interface TestVectorReport {
  /** The total number of JUnit XML files */
  totalJunitFiles: number
  /** The total number of test vectors */
  totalTestVectors: number
  /** The total number of JUnit test cases */
  totalJunitTestCases: number
  /** The total number of test cases in the spec */
  specTestCases: number
  /** The number of failed spec test cases */
  specFailedTestCases: number
  /** The number of passed spec test cases */
  specPassedTestCases: number
  /** The number of skipped spec test cases */
  specSkippedTestCases: number
  /** The test vectors that are missing */
  missingVectors: TestVector[]
  /** The test vectors that have failed test cases */
  failedVectors: TestVector[]
  /** The test vectors that have skipped test cases */
  skippedVectors: TestVector[]
  /** The test vectors that have passed test cases */
  successVectors: TestVector[]
}

/**
 * Parses the test vector results from the JUnit XML files against the
 * test vectors located in the spec path glob pattern.
 */
export const buildTestVectorReport = async (
  specPath: string,
  reportFiles: string[],
  testCasesPrefix: string
): Promise<TestVectorReport> => {
  const testVectors = await getTestVectors(specPath)
  const testVectorReport: TestVectorReport = {
    totalJunitFiles: reportFiles.length,
    totalTestVectors: testVectors.length,
    totalJunitTestCases: 0,
    specTestCases: 0,
    specFailedTestCases: 0,
    specPassedTestCases: 0,
    specSkippedTestCases: 0,
    missingVectors: [],
    failedVectors: [],
    skippedVectors: [],
    successVectors: []
  }

  const junitTestCases = await parseJunitTestCases(reportFiles)
  const { totalJunitTestCases, totalSpecTestCases } =
    addJunitToVectorsTestCases(junitTestCases, testVectors, testCasesPrefix)
  testVectorReport.totalJunitTestCases = totalJunitTestCases
  testVectorReport.specTestCases = totalSpecTestCases
  core.info(
    `JUnit test cases parsed!\n${JSON.stringify(
      { totalJunitTestCases, totalSpecTestCases },
      null,
      2
    )}`
  )

  for (const testVector of testVectors) {
    if (testVector.testCases.length === 0) {
      testVectorReport.missingVectors.push(testVector)
      continue
    }

    let hasFailedCases = false
    let hasSkippedCases = false

    for (const testCase of testVector.testCases) {
      if (testCase.skipped) {
        hasSkippedCases = true
        testVectorReport.specSkippedTestCases++
      } else if (testCase.failure || testCase.error) {
        hasFailedCases = true
        testVectorReport.specFailedTestCases++
      } else {
        testVectorReport.specPassedTestCases++
      }
    }

    if (hasFailedCases) {
      testVectorReport.failedVectors.push(testVector)
    } else if (hasSkippedCases) {
      testVectorReport.skippedVectors.push(testVector)
    } else {
      testVectorReport.successVectors.push(testVector)
    }
  }

  core.info(
    `Test vector report computed!${JSON.stringify(testVectorReport, null, 2)}`
  )
  return testVectorReport
}

/**
 * Reads the test vectors from the spec path.
 * @returns An array of test vectors.
 */
const getTestVectors = async (specPath: string): Promise<TestVector[]> => {
  const specPathGlob = `${specPath}/**/test-vectors/**/*.json`
  const testVectorsFiles = await getFiles(specPathGlob)
  return testVectorsFiles.filter(checkTestVectorFile).map(mapTestVectorFile)
}

/**
 * Checks if the test vector file is valid.
 * @param file - The file path of the test vector file
 * @returns True if the test vector file is valid, false otherwise
 */
const checkTestVectorFile = (file: string): boolean => {
  const json = readJsonFile(file) as {
    description: string
    input?: unknown
    output?: unknown
    vectors?: unknown
  }

  // description is a mandatory field
  if (!json.description) return false

  const tbDexSpecFormat = Boolean(json.input && json.output)
  const web5SpecFormat = Boolean(json.vectors)

  return tbDexSpecFormat || web5SpecFormat
}

/**
 * Maps the test vector file to a test vector object.
 * @param file - The file path of the test vector file
 * @returns The test vector object
 */
const mapTestVectorFile = (file: string): TestVector => {
  const fileFullPath = file.split('/')
  const fileName = fileFullPath.pop()
  if (!fileName) {
    throw new Error(`Test vector file name for ${file} is missing`)
  }

  let fileFolderName = fileFullPath.pop()
  if (fileFolderName === 'vectors') {
    // ignore the vectors folder to get the parent folder name
    // eg. .../protocol/vectors/parse-balance.json category = protocol
    fileFolderName = fileFullPath.pop()
  }

  const category = fileFolderName?.replace(/-/g, '_').toLowerCase() || ''
  const name = fileName.split('.')[0].replace(/-/g, '_').toLowerCase()

  const testVector = {
    category,
    name,
    file,
    testCases: []
  }

  core.info(`Test vector: ${JSON.stringify(testVector)}`)
  return testVector
}

const addJunitToVectorsTestCases = (
  junitTestCases: TestCase[],
  testVectors: TestVector[],
  testCasesPrefix: string
): { totalJunitTestCases: number; totalSpecTestCases: number } => {
  const totalJunitTestCases = junitTestCases.length

  let totalSpecTestCases = 0
  for (const testCase of junitTestCases) {
    if (testCasesPrefix && !testCase.name?.startsWith(testCasesPrefix)) continue

    // check if testcase is relevant to any test vector key
    const testVector = testVectors.find(test => {
      const testCaseName = testCase.name?.toLowerCase() || ''
      const testCaseNameWords = testCaseName.split(' ')
      return (
        // test case has the same name as the test vector
        testCaseNameWords.find(word => word === test.name) &&
        // and test case contains the test vector category
        testCaseName.includes(test.category)
      )
    })
    if (!testVector) continue
    testVector.testCases.push(testCase)
    totalSpecTestCases++
  }

  return { totalJunitTestCases, totalSpecTestCases }
}
