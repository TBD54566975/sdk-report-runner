import * as files from '../src/files'
import * as junitHandler from '../src/junit-handler'
import { buildTestVectorReport } from '../src/test-vectors'
import { WEB5_KT_JUNIT_FILES, WEB5_TEST_VECTORS_FILES } from './mocks'

// Mock sed functions
let getFilesMock: jest.SpiedFunction<typeof files.getFiles>
let readJsonFileMock: jest.SpiedFunction<typeof files.readJsonFile>
let parseJunitTestCasesMock: jest.SpiedFunction<
  typeof junitHandler.parseJunitTestSuites
>

describe('test-vectors', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getFilesMock = jest.spyOn(files, 'getFiles').mockImplementation()
    readJsonFileMock = jest.spyOn(files, 'readJsonFile').mockImplementation()
    parseJunitTestCasesMock = jest.spyOn(junitHandler, 'parseJunitTestSuites')
  })

  it('builds a test vector report for a web5-kt junit files sample with six test cases only', async () => {
    getFilesMock.mockResolvedValue(WEB5_TEST_VECTORS_FILES)
    readJsonFileMock.mockReturnValue({
      description: 'Valid test vector',
      vectors: []
    })

    const report = await buildTestVectorReport(
      'web5-spec',
      WEB5_KT_JUNIT_FILES,
      {
        suiteName: 'Web5TestVectors',
        feature: 'Web5TestVectors(\\w+)',
        vector: '(\\w+)'
      }
    )

    expect(parseJunitTestCasesMock).toHaveBeenCalledWith(WEB5_KT_JUNIT_FILES)

    expect(report.totalJunitFiles).toBe(2)
    expect(report.totalTestVectors).toBe(18)
    expect(report.totalJunitTestCases).toBe(7)
    expect(report.specTestCases).toBe(6)
    expect(report.specFailedTestCases).toBe(0)
    expect(report.specPassedTestCases).toBe(6)
    expect(report.missingVectors).toHaveLength(12)
    expect(report.failedVectors).toHaveLength(0)
    expect(report.skippedVectors).toHaveLength(0)
    expect(report.successVectors).toEqual([
      {
        feature: 'Credentials',
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
        feature: 'Credentials',
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
        feature: 'PresentationExchange',
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
        feature: 'PresentationExchange',
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
        feature: 'PresentationExchange',
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
        feature: 'PresentationExchange',
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

  it('builds a test vector report for a web5-swift junit files sample with two test cases only', async () => {
    getFilesMock.mockResolvedValue(WEB5_TEST_VECTORS_FILES)
    readJsonFileMock.mockReturnValue({
      description: 'Valid test vector',
      vectors: []
    })

    const swiftJunitFiles = [`${__dirname}/assets/web5-swift-tests.xml`]
    const report = await buildTestVectorReport('web5-spec', swiftJunitFiles, {
      suiteName: 'Web5TestVectors',
      feature: 'Web5TestVectors(\\w+)',
      vector: 'test_(\\w+)'
    })

    expect(parseJunitTestCasesMock).toHaveBeenCalledWith(swiftJunitFiles)

    expect(report.totalJunitFiles).toBe(1)
    expect(report.totalTestVectors).toBe(18)
    expect(report.totalJunitTestCases).toBe(113)
    expect(report.specTestCases).toBe(7)
    expect(report.specFailedTestCases).toBe(0)
    expect(report.specPassedTestCases).toBe(7)
    expect(report.missingVectors).toHaveLength(11)
    expect(report.failedVectors).toHaveLength(0)
    expect(report.skippedVectors).toHaveLength(0)
    expect(report.successVectors).toEqual([
      {
        feature: 'CryptoEd25519',
        name: 'sign',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_ed25519/sign.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsCryptoEd25519 test_sign]',
            name: '-[Web5TestVectorsCryptoEd25519 test_sign]',
            time: 0.005900025367736816
          }
        ]
      },
      {
        feature: 'CryptoEd25519',
        name: 'verify',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_ed25519/verify.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsCryptoEd25519 test_verify]',
            name: '-[Web5TestVectorsCryptoEd25519 test_verify]',
            time: 0.0023189783096313477
          }
        ]
      },
      {
        feature: 'CryptoEs256k',
        name: 'sign',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_es256k/sign.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsCryptoEs256k test_sign]',
            name: '-[Web5TestVectorsCryptoEs256k test_sign]',
            time: 0.0010569095611572266
          }
        ]
      },
      {
        feature: 'CryptoEs256k',
        name: 'verify',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/crypto_es256k/verify.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsCryptoEs256k test_verify]',
            name: '-[Web5TestVectorsCryptoEs256k test_verify]',
            time: 0.003018021583557129
          }
        ]
      },
      {
        feature: 'DidJwk',
        name: 'resolve',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/did_jwk/resolve.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsDidJwk test_resolve]',
            name: '-[Web5TestVectorsDidJwk test_resolve]',
            time: 0.0010809898376464844
          }
        ]
      },
      {
        feature: 'DidWeb',
        name: 'resolve',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/did_web/resolve.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsDidWeb test_resolve]',
            name: '-[Web5TestVectorsDidWeb test_resolve]',
            time: 0.002763986587524414
          }
        ]
      },
      {
        feature: 'PortableDid',
        name: 'parse',
        file: '/home/runner/work/web5-kt/web5-kt/web5-spec/test-vectors/portable_did/parse.json',
        testCases: [
          {
            classname: '-[Web5TestVectorsPortableDid test_parse]',
            name: '-[Web5TestVectorsPortableDid test_parse]',
            time: 0.0011639595031738281
          }
        ]
      }
    ])
  })
})
