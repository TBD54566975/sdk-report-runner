import * as core from '@actions/core'
import { SuiteRegexStrFilters } from './test-vectors'

/**
 * Inputs for the action.
 */
export interface ActionInputs {
  /** The paths to the JUnit XML files */
  junitReportPaths: string
  /** The path to the spec files */
  specPath: string
  /** The regex filters for the test suite name, spec feature, and spec vector name */
  suiteRegexStrFilters: SuiteRegexStrFilters
  /** The GitHub token to use for adding a comment to the PR */
  gitToken: string
  /** Whether to add the report as a comment to the PR */
  commentOnPr: boolean
  /** The package name to comment on the PR */
  commentPackage: string
  /** Whether to fail the job if missing test vectors are found */
  failOnMissingVectors: boolean
  /** Whether to fail the job if failed test cases are found */
  failOnFailedTestCases: boolean
  /** The release mode to handle conformance dashboard */
  releaseMode: string
  /** The release repo, eg: TBD54566975/web5-spec for spec releases, TBD54566975/web5-rs */
  releaseRepo: string
  /** The name of the package that is being released (useful for monorepos, eg: web5-rs releases web5-core-kt) */
  releasePackageName: string
  /** The tag of the release */
  releaseTag: string
  /** The name of the spec, eg: web5-spec */
  specName: string
  /** The tag of the spec, eg: v2.0 */
  specTag: string
}

/**
 * Reads the inputs for the action.
 * @returns {ActionInputs} The inputs for the action.
 */
export const readActionInputs = (): ActionInputs => {
  const releaseMode = core.getInput('release-mode') || 'none'
  const isDefaultReport = releaseMode === 'none'
  const isReleaseSpecMode = releaseMode === 'spec'
  const isReleaseSdkMode = releaseMode === 'sdk'
  if (!isReleaseSpecMode && !isReleaseSdkMode && !isDefaultReport) {
    throw new Error('Invalid release mode')
  }

  const isReleaseMode = isReleaseSpecMode || isReleaseSdkMode

  const junitReportPaths = core.getInput('junit-report-paths', {
    required: isDefaultReport || isReleaseSdkMode
  })
  const specPath = core.getInput('spec-path', {
    required: isReleaseSpecMode || isDefaultReport
  })

  // Fallback to the default tbdex-js regex filters if not provided
  const suiteRegexStrFilters = {
    suiteName: core.getInput('suite-name-regex') || 'TbdexTestVector',
    feature: core.getInput('feature-regex') || 'TbdexTestVectors(\\w+)',
    vector: core.getInput('vector-regex') || 'TbdexTestVectors(\\w+) (\\w+)',
    extractFeatureOnTestCaseName:
      core.getInput('extract-feature-on-test-case-name') === 'true',
    prettifyFeature: core.getInput('prettify-feature') === 'true'
  }

  const commentOnPr = core.getInput('comment-on-pr') === 'true'
  const commentPackage = core.getInput('comment-package') || ''
  const gitToken = core.getInput('git-token', {
    required: commentOnPr || isReleaseMode
  })
  const failOnMissingVectors =
    core.getInput('fail-on-missing-vectors') === 'true'
  const failOnFailedTestCases =
    core.getInput('fail-on-failed-test-cases') === 'true'

  const releaseRepo = core.getInput('release-repo', {
    required: isReleaseMode
  })
  const releaseTag = core.getInput('release-tag', {
    required: isReleaseSdkMode
  })

  const specName = core.getInput('spec-name', {
    required: isReleaseMode
  })
  const specTag = core.getInput('spec-tag', {
    required: isReleaseMode
  })
  const releasePackageName = core.getInput('release-package-name', {
    required: isReleaseSdkMode
  })

  return {
    junitReportPaths,
    specPath,
    suiteRegexStrFilters,
    gitToken,
    commentOnPr,
    commentPackage,
    failOnMissingVectors,
    failOnFailedTestCases,
    releaseMode,
    releaseRepo,
    releaseTag,
    releasePackageName,
    specName,
    specTag
  }
}
