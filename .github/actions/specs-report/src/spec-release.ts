import * as core from '@actions/core'

import {
  extractJunitVectorsTestCases,
  getTestVectors,
  SuiteRegexStrFilters,
  TestVector
} from './test-vectors'
import { readGhPagesFile, writeGhPagesFile } from './gh-utils'
import { ActionInputs } from './action-inputs'
import { getFiles } from './files'
import { parseJunitTestSuites, TestCase } from './junit-handler'

export interface SpecRelease {
  version: string
  releaseLink: string
  testVectors: SpecReleaseTestVectors
  sdks: Record<string, SdkEntry>
}

export interface SpecReleaseTestVectors {
  srcLink: string
  cases: Record<string, string[]>
}

export type SdkTestResultStatus = 'passed' | 'failed' | 'skipped' | 'unknown'

export interface SdkTestResult {
  status: SdkTestResultStatus
  details?: string
}

export type SdkEntryCasesReport = Record<string, Record<string, SdkTestResult>>

export type SdkAggregatedStatus = 'passed' | 'failed' | 'missing'

export interface SdkEntry {
  version: string
  releaseLink: string
  casesReport: SdkEntryCasesReport
  status: SdkAggregatedStatus
}

export interface ConformanceData {
  specReleases: SpecRelease[]
}

export interface ConformanceDataFile {
  data: ConformanceData
  sha?: string
}

export const handleSpecRelease = async (
  inputs: ActionInputs
): Promise<void> => {
  const { specPath, releaseRepo, specTag, specName, gitToken } = inputs
  const testVectors = await getTestVectors(specPath)
  const specReleaseTestVectors = testVectorsToSpecRelease(
    releaseRepo,
    specTag,
    testVectors
  )

  const specReleaseLink = getReleaseLink(releaseRepo, specTag)

  return addSpecReleaseEntry(
    specName,
    specTag,
    specReleaseLink,
    specReleaseTestVectors,
    gitToken
  )
}

export const handleSdkRelease = async (inputs: ActionInputs): Promise<void> => {
  const {
    junitReportPaths,
    suiteRegexStrFilters,
    releaseRepo,
    releasePackageName,
    releaseTag,
    specName,
    specTag,
    gitToken
  } = inputs

  const specConformanceJsonFileName = `spec-conformance-${specName}.json`
  const { data, sha: originalSha } = await readSpecConformanceJson(
    specConformanceJsonFileName,
    gitToken
  )
  const specRelease = data.specReleases.find(
    release => release.version === specTag
  )
  if (!specRelease) {
    throw new Error(
      `Spec release ${specTag} not found in conformance JSON yet. Are you sure you released the spec or have the right spec version?`
    )
  }

  const sdkCasesReport = await extractSdkTestVectorCases(
    junitReportPaths,
    suiteRegexStrFilters
  )
  core.info(
    `Extracted SDK test cases:\n${JSON.stringify(sdkCasesReport, null, 2)}`
  )

  const status = calculateSdkStatus(sdkCasesReport, specRelease.testVectors)

  const releaseLink = getReleaseLink(releaseRepo, releaseTag)
  specRelease.sdks[releasePackageName] = {
    version: releaseTag,
    releaseLink,
    casesReport: sdkCasesReport,
    status
  }

  return writeSpecConformanceJson(
    releasePackageName,
    releaseTag,
    specConformanceJsonFileName,
    gitToken,
    data,
    originalSha
  )
}

export const extractSdkTestVectorCases = async (
  junitReportPaths: string,
  suiteRegexStrFilters: SuiteRegexStrFilters
): Promise<SdkEntryCasesReport> => {
  const reportFiles = await getFiles(junitReportPaths)
  const junitTestSuites = await parseJunitTestSuites(reportFiles)
  const testVectorsCases = extractJunitVectorsTestCases(
    junitTestSuites,
    suiteRegexStrFilters
  )
  return testVectorsCases.reduce((acc, { feature, name, testCase }) => {
    acc[feature] = acc[feature] || {}
    acc[feature][name] = mapTestCaseStatusResult(testCase)
    return acc
  }, {} as SdkEntryCasesReport)
}

const mapTestCaseStatusResult = (testCase: TestCase): SdkTestResult => {
  const status = (testCase.status ?? 'passed') as SdkTestResultStatus
  const testCaseDetails = testCase.error ?? testCase.failure ?? []
  const details = testCaseDetails
    .map(detail => `${detail.inner || ''}  ${detail.message || ''}`)
    .join('\n')
  return { status, details: details || undefined }
}

const testVectorsToSpecRelease = (
  releaseRepo: string,
  specTag: string,
  testVectors: TestVector[]
): SpecReleaseTestVectors => {
  if (testVectors.length === 0) {
    throw new Error('No test vectors found')
  }

  const [owner, repo] = releaseRepo.split('/')
  const srcLink = `https://github.com/${owner}/${repo}/tree/${specTag}/test-vectors`

  // Group test cases by feature
  const cases = testVectors.reduce(
    (acc, { feature, name }) => {
      acc[feature] = acc[feature] || []
      acc[feature].push(name)
      return acc
    },
    {} as Record<string, string[]>
  )

  return {
    srcLink,
    cases
  }
}

const addSpecReleaseEntry = async (
  specName: string,
  specTag: string,
  specReleaseLink: string,
  testVectors: SpecReleaseTestVectors,
  gitToken: string
): Promise<void> => {
  const specConformanceJsonFileName = `spec-conformance-${specName}.json`

  const { data, sha: originalSha } = await readSpecConformanceJson(
    specConformanceJsonFileName,
    gitToken
  )

  const currentRelease = data.specReleases.find(
    release => release.version === specTag
  )
  if (currentRelease) {
    core.warning(
      `Spec version ${specTag} already exists in the conformance JSON, overriding spec test vectors array only.`
    )
    currentRelease.testVectors = testVectors
  } else {
    // Create new spec release entry
    const newSpecRelease: SpecRelease = {
      version: specTag,
      releaseLink: specReleaseLink,
      testVectors,
      sdks: {}
    }
    data.specReleases.unshift(newSpecRelease)
  }

  await writeSpecConformanceJson(
    specName,
    specTag,
    specConformanceJsonFileName,
    gitToken,
    data,
    originalSha
  )
}

const getReleaseLink = (userRepo: string, releaseTag: string): string => {
  const fullRepoName = !userRepo.includes('/')
    ? `TBD54566975/${userRepo}`
    : userRepo
  const [owner, repo] = fullRepoName.split('/')
  return `https://github.com/${owner}/${repo}/releases/tag/${releaseTag}`
}

export const readSpecConformanceJson = async (
  specConformanceJsonFileName: string,
  gitToken: string
): Promise<ConformanceDataFile> => {
  const ghPagesFile = await readGhPagesFile(
    specConformanceJsonFileName,
    gitToken
  )

  if (!ghPagesFile) {
    const initialConformanceData = { data: { specReleases: [] } }
    core.warning(
      `Conformance dashboard JSON file not found, initializing new conformance JSON ${initialConformanceData}...`
    )
    return initialConformanceData
  }

  try {
    const data: ConformanceData = JSON.parse(ghPagesFile.content)
    return { data, sha: ghPagesFile.sha }
  } catch (error) {
    throw new Error(`Failed to parse conformance JSON: ${error}`)
  }
}

export const writeSpecConformanceJson = async (
  releaseRepo: string,
  releaseTag: string,
  specConformanceJsonFileName: string,
  gitToken: string,
  conformanceData: ConformanceData,
  originalSha?: string
): Promise<void> => {
  const conformanceJsonString = JSON.stringify(conformanceData, null, 2)
  core.info(
    `Writing spec conformance ${specConformanceJsonFileName}:\n${conformanceJsonString}`
  )
  return writeGhPagesFile(
    specConformanceJsonFileName,
    conformanceJsonString,
    gitToken,
    `[ci] Update ${specConformanceJsonFileName}: ${releaseRepo}@${releaseTag}`,
    originalSha
  )
}

export const calculateSdkStatus = (
  sdkCasesReport: SdkEntryCasesReport,
  specReleaseTestVectors: SpecReleaseTestVectors
): SdkAggregatedStatus => {
  let status: SdkAggregatedStatus = 'passed'
  for (const feature of Object.keys(specReleaseTestVectors.cases)) {
    const sdkFeatureCases = sdkCasesReport[feature]
    if (!sdkFeatureCases) {
      status = 'missing'
      continue
    }

    const specTestCases = specReleaseTestVectors.cases[feature]
    for (const specTestCase of specTestCases) {
      const sdkTestCase = sdkFeatureCases[specTestCase]
      if (!sdkTestCase) {
        status = 'missing'
        continue
      }

      if (sdkTestCase.status !== 'passed') {
        return 'failed'
      }
    }
  }

  return status
}
