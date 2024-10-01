import { handleSdkRelease } from '../src/spec-release'
import * as specRelease from '../src/spec-release'
import { ActionInputs } from '../src/action-inputs'
import { SuiteRegexStrFilters } from '../src/test-vectors'

import mockedSpecConformanceWeb5Spec from './assets/release-sample-web5-rs-v4.0.0/spec-conformance-web5-spec.json'

// Mock the required modules and functions
jest.mock('@actions/github')
jest.mock('@actions/core')

const mockedJUnitReportPathsBase =
  './__tests__/assets/release-sample-web5-rs-v4.0.0'

describe('handleSdkRelease', () => {
  // Mock input data
  const mockInputs: ActionInputs = {
    junitReportPaths: `${mockedJUnitReportPathsBase}/kotlin-test-results`,
    suiteRegexStrFilters: {
      suiteName: 'Web5TestVectors',
      feature: 'Web5TestVectorsTest\\$Web5TestVectors(\\w+)',
      vector: '(\\w+)',
      extractFeatureOnTestCaseName: false
    },
    releaseRepo: 'TBD54566975/web5-rs',
    releasePackageName: 'web5-core-kt',
    releaseTag: 'v4.0.0',
    specName: 'web5-spec',
    specTag: 'v0.3.1-alpha',
    gitToken: 'mock-token',
    specPath: '',
    commentOnPr: false,
    failOnMissingVectors: false,
    failOnFailedTestCases: false,
    releaseMode: 'sdk',
    packageName: ''
  }

  const mockOctokit = {
    rest: {
      repos: {
        createOrUpdateFileContents: jest.fn()
      }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock readSpecConformanceJson
    const deepCopiedConformanceJson = {
      data: JSON.parse(JSON.stringify(mockedSpecConformanceWeb5Spec)),
      sha: 'fake-sha'
    }

    jest
      .spyOn(specRelease, 'readSpecConformanceJson')
      .mockResolvedValue(deepCopiedConformanceJson)

    // // Mock extractSdkTestVectorCases
    // jest
    //   .spyOn(testVectors, 'extractJunitVectorsTestCases')
    //   .mockResolvedValue([])
    jest.spyOn(specRelease, 'extractSdkTestVectorCases')
    //   .mockResolvedValue(mockSdkCasesReport)

    // Mock writeSpecConformanceJson
    jest.spyOn(specRelease, 'writeSpecConformanceJson').mockResolvedValue()

    // Mock github.context
    jest.mock('@actions/github', () => ({
      getOctokit: jest.fn().mockImplementation(() => mockOctokit),
      context: {
        repo: { owner: 'TBD54566975', repo: 'sdk-report-runner' }
      }
    }))
  })

  it('should handle kotlin SDK release and update conformance JSON', async () => {
    const packageName = 'web5-core-kt'
    const junitReportPaths = 'kotlin-test-results'
    const suiteRegexStrFilters = {
      suiteName: 'Web5TestVectors',
      feature: 'Web5TestVectorsTest\\$Web5TestVectors(\\w+)',
      vector: '(\\w+)'
    }
    const expectedCases: specRelease.SdkEntryCasesReport = {
      CryptoEd25519: {
        verify: {
          status: 'passed'
        },
        sign: {
          status: 'passed'
        }
      },
      DidJwk: {
        resolve: {
          status: 'passed'
        }
      }
    }
    const isSuccess = await assertSdkRelease(
      packageName,
      junitReportPaths,
      suiteRegexStrFilters,
      expectedCases
    )
    expect(isSuccess).toBe(true)
  })

  it('should handle rust SDK release and update conformance JSON', async () => {
    const packageName = 'web5-rs'
    const junitReportPaths = 'rust-test-results'
    const suiteRegexStrFilters = {
      suiteName: 'Web5TestVectors',
      feature: '',
      vector: 'test_vectors::test_vectors::(.+)::(.+)$',
      extractFeatureOnTestCaseName: true,
      prettifyFeature: true
    }
    const expectedCases: specRelease.SdkEntryCasesReport = {
      CryptoEd25519: {
        verify: {
          status: 'passed'
        },
        sign: {
          status: 'passed'
        }
      },
      Credentials: {
        verify: {
          status: 'passed'
        }
      },
      DidJwk: {
        resolve: {
          status: 'passed'
        }
      },
      DidDht: {
        resolve: {
          status: 'passed'
        }
      }
    }
    const isSuccess = await assertSdkRelease(
      packageName,
      junitReportPaths,
      suiteRegexStrFilters,
      expectedCases
    )
    expect(isSuccess).toBe(true)
  })

  const assertSdkRelease = async (
    releasePackageName: string,
    junitPath: string,
    suiteRegexStrFilters: SuiteRegexStrFilters,
    expectedCases: specRelease.SdkEntryCasesReport
  ): Promise<boolean> => {
    const junitReportPaths = `${mockedJUnitReportPathsBase}/${junitPath}`
    await handleSdkRelease({
      ...mockInputs,
      junitReportPaths,
      suiteRegexStrFilters,
      releasePackageName
    })

    // Verify readSpecConformanceJson was called with the correct filename
    expect(specRelease.readSpecConformanceJson).toHaveBeenCalledWith(
      'spec-conformance-web5-spec.json',
      'mock-token'
    )

    // Verify extractSdkTestVectorCases was called with correct inputs
    expect(specRelease.extractSdkTestVectorCases).toHaveBeenCalledWith(
      junitReportPaths,
      suiteRegexStrFilters
    )

    expect(specRelease.writeSpecConformanceJson).toHaveBeenCalledWith(
      releasePackageName,
      mockInputs.releaseTag,
      'spec-conformance-web5-spec.json',
      mockInputs.gitToken,
      {
        specReleases: [
          {
            ...mockedSpecConformanceWeb5Spec.specReleases[0],
            sdks: {
              [releasePackageName]: {
                version: 'v4.0.0',
                releaseLink:
                  'https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0',
                casesReport: expectedCases
              }
            }
          }
        ]
      },
      'fake-sha'
    )

    return true
  }

  it('should throw an error if spec release is not found', async () => {
    const invalidInputs = { ...mockInputs, specTag: 'v2.0.0' }

    await expect(handleSdkRelease(invalidInputs)).rejects.toThrow(
      'Spec release v2.0.0 not found in conformance JSON yet. Are you sure you released the spec or have the right spec version?'
    )
  })
})