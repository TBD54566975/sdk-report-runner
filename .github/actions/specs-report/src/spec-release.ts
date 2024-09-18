import * as github from '@actions/github'
import * as core from '@actions/core'

import {
  extractJunitVectorsTestCases,
  getTestVectors,
  SuiteRegexStrFilters,
  TestVector
} from './test-vectors'
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

interface SdkEntry {
  version: string
  releaseLink: string
  casesReport: SdkEntryCasesReport
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

  const releaseLink = getReleaseLink(releaseRepo, releaseTag)
  specRelease.sdks[releasePackageName] = {
    version: releaseTag,
    releaseLink,
    casesReport: sdkCasesReport
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
  try {
    const reportRepo = github.context.repo
    const octokit = github.getOctokit(gitToken)
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: reportRepo.owner,
      repo: reportRepo.repo,
      path: specConformanceJsonFileName,
      ref: 'gh-pages'
    })
    if ('content' in fileData) {
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
      const data: ConformanceData = JSON.parse(content)
      return { data, sha: fileData.sha }
    } else {
      throw new Error('Unexpected response format')
    }
  } catch (error) {
    if ((error as { status: number }).status === 404) {
      const initialConformanceData = { data: { specReleases: [] } }
      core.warning(
        `Conformance dashboard JSON file not found, initializing new conformance JSON ${initialConformanceData}...`
      )
      return initialConformanceData
    }
    core.error(`Conformance dashboard read failure: ${error}`)
    throw error
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

  const isTest = process.env.SKIP_WRITE_CONFORMANCE_JSON === 'true'

  if (!isTest) {
    const reportRepo = github.context.repo
    const octokit = github.getOctokit(gitToken)
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: reportRepo.owner,
      repo: reportRepo.repo,
      path: specConformanceJsonFileName,
      message: `[ci] Update ${specConformanceJsonFileName}: ${releaseRepo}@${releaseTag}`,
      content: Buffer.from(conformanceJsonString).toString('base64'),
      sha: originalSha,
      branch: 'gh-pages'
    })
  } else {
    core.info(`Test mode, skipping write to ${specConformanceJsonFileName}...`)
  }
}
