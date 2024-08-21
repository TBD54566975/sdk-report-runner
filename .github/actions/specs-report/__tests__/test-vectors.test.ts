import * as files from '../src/files'
import * as junitHandler from '../src/junit-handler'
import { buildTestVectorReport } from '../src/test-vectors'
import { WEB5_KT_JUNIT_FILES, WEB5_TEST_VECTORS_FILES } from './mocks'

// Mock sed functions
let getFilesMock: jest.SpiedFunction<typeof files.getFiles>
let readJsonFileMock: jest.SpiedFunction<typeof files.readJsonFile>
let parseJunitTestCasesMock: jest.SpiedFunction<
  typeof junitHandler.parseJunitTestCases
>

describe('test-vectors', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getFilesMock = jest.spyOn(files, 'getFiles').mockImplementation()
    readJsonFileMock = jest.spyOn(files, 'readJsonFile').mockImplementation()
    parseJunitTestCasesMock = jest.spyOn(junitHandler, 'parseJunitTestCases')
  })

  it('builds a test vector report for a web5-kt junit files sample with two test cases only', async () => {
    getFilesMock.mockResolvedValue(WEB5_TEST_VECTORS_FILES)
    readJsonFileMock.mockReturnValue({
      description: 'Valid test vector',
      vectors: []
    })

    const report = await buildTestVectorReport(
      'web5-spec',
      WEB5_KT_JUNIT_FILES,
      ''
    )

    expect(parseJunitTestCasesMock).toHaveBeenCalledWith(WEB5_KT_JUNIT_FILES)

    expect(report.totalJunitFiles).toBe(2)
    expect(report.totalTestVectors).toBe(19)
    expect(report.totalJunitTestCases).toBe(7)
    expect(report.specTestCases).toBe(6)
    expect(report.specFailedTestCases).toBe(0)
    expect(report.specPassedTestCases).toBe(6)
    expect(report.missingVectors).toHaveLength(13)
    expect(report.failedVectors).toHaveLength(0)
    expect(report.skippedVectors).toHaveLength(0)
    expect(report.successVectors).toEqual([
      {
        category: 'credentials',
        name: 'create',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/credentials/create.json',
        testCases: [
          {
            name: 'create',
            classname: 'web5.sdk.credentials.Web5TestVectorsCredentials',
            time: 0.062
          }
        ]
      },
      {
        category: 'credentials',
        name: 'verify',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/credentials/verify.json',
        testCases: [
          {
            name: 'verify',
            classname: 'web5.sdk.credentials.Web5TestVectorsCredentials',
            time: 0.038
          }
        ]
      },
      {
        category: 'presentation_exchange',
        name: 'create_presentation_from_credentials',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/create_presentation_from_credentials.json',
        testCases: [
          {
            name: 'create_presentation_from_credentials',
            classname:
              'web5.sdk.credentials.Web5TestVectorsPresentationExchange',
            time: 0.01
          }
        ]
      },
      {
        category: 'presentation_exchange',
        name: 'select_credentials',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/select_credentials.json',
        testCases: [
          {
            name: 'select_credentials',
            classname:
              'web5.sdk.credentials.Web5TestVectorsPresentationExchange',
            time: 0.008
          }
        ]
      },
      {
        category: 'presentation_exchange',
        name: 'validate_definition',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/validate_definition.json',
        testCases: [
          {
            name: 'validate_definition',
            classname:
              'web5.sdk.credentials.Web5TestVectorsPresentationExchange',
            time: 0.008
          }
        ]
      },
      {
        category: 'presentation_exchange',
        name: 'validate_submission',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/presentation_exchange/validate_submission.json',
        testCases: [
          {
            name: 'validate_submission',
            classname:
              'web5.sdk.credentials.Web5TestVectorsPresentationExchange',
            time: 0.007
          }
        ]
      }
    ])
  })
})
