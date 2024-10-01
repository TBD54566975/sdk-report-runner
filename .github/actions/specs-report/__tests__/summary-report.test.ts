import * as core from '@actions/core'
import { TestVector, TestVectorReport } from '../src/test-vectors'
import { generateSummary } from '../src/summary-report'

describe('summary-report', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(core.summary, 'write').mockImplementation()
  })

  it('should generate summary with package name', () => {
    const mockReport: TestVectorReport = {
      totalJunitFiles: 1,
      totalTestVectors: 10,
      totalJunitTestCases: 20,
      specTestCases: 15,
      specFailedTestCases: 2,
      specPassedTestCases: 12,
      specSkippedTestCases: 1,
      missingVectors: [],
      failedVectors: [],
      skippedVectors: [],
      successVectors: []
    }

    const summary = generateSummary(mockReport, 'test-package')
    expect(summary).toContain('TBD Spec Test Vectors Report (test-package)')
  })

  it('should generate summary without package name', () => {
    const mockReport: TestVectorReport = {
      totalJunitFiles: 1,
      totalTestVectors: 5,
      totalJunitTestCases: 10,
      specTestCases: 8,
      specFailedTestCases: 1,
      specPassedTestCases: 6,
      specSkippedTestCases: 1,
      missingVectors: [],
      failedVectors: [],
      skippedVectors: [],
      successVectors: []
    }

    const summary = generateSummary(mockReport, '')
    expect(summary).toContain('TBD Spec Test Vectors Report')
  })

  it('should add success message when all vectors pass', () => {
    const mockReport: TestVectorReport = {
      totalJunitFiles: 1,
      totalTestVectors: 2,
      totalJunitTestCases: 10,
      specTestCases: 2,
      specFailedTestCases: 0,
      specPassedTestCases: 2,
      specSkippedTestCases: 0,
      missingVectors: [],
      failedVectors: [],
      skippedVectors: [],
      successVectors: [
        { feature: 'Test', name: 'Vector', file: 'test.json', testCases: [] },
        { feature: 'Test', name: 'Vector2', file: 'test2.json', testCases: [] }
      ]
    }

    const summary = generateSummary(mockReport, '')
    expect(summary).toContain('✅ All test vectors passed')
  })

  it('should add info message when not all vectors pass', () => {
    const mockReport: TestVectorReport = {
      totalJunitFiles: 1,
      totalTestVectors: 5,
      totalJunitTestCases: 10,
      specTestCases: 10,
      specFailedTestCases: 1,
      specPassedTestCases: 9,
      specSkippedTestCases: 0,
      missingVectors: [],
      failedVectors: [
        { feature: 'Test', name: 'Vector', file: 'test.json', testCases: [] }
      ],
      skippedVectors: [],
      successVectors: []
    }

    const summary = generateSummary(mockReport, '')
    expect(summary).toContain('ℹ️ 0 out of 5 test vectors passed successfully.')
  })

  it('should display the error message in the markdown table properly', () => {
    const tbdexKtErrorSample: TestVector = {
      feature: 'Protocol',
      name: 'parse_rfq',
      file: '/home/runner/work/tbdex-kt/tbdex-kt/tbdex/hosted/test-vectors/protocol/vectors/parse-rfq.json',
      testCases: [
        {
          name: 'parse_rfq',
          classname: 'tbdex.sdk.protocol.TbdexTestVectorsProtocol',
          time: 13.913,
          error: [
            {
              inner:
                'java.lang.IllegalStateException: Verification failed. Failed to resolve kid. Error: internalError\n\tat web5.sdk.jose.jws.DecodedJws.verify(Jws.kt:262)\n\tat tbdex.sdk.protocol.SignatureVerifier.verify(SignatureVerifier.kt:60)\n\tat tbdex.sdk.protocol.models.Message.verify(Message.kt:82)\n\tat tbdex.sdk.protocol.Parser.parseMessage(Parser.kt:45)\n\tat tbdex.sdk.protocol.TbdexTestVectorsProtocol.parse_rfq(TbdexTestVectorsProtocol.kt:145)\n\tat java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\n\tat java.base/jdk.internal.reflect....\n',
              message:
                'Verification failed. Failed to resolve kid. Error: internalError',
              type: 'java.lang.IllegalStateException'
            }
          ],
          'system-err': [
            'SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".\nSLF4J: Defaulting to no-operation (NOP) logger implementation\nSLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.\n'
          ]
        }
      ]
    }

    const report: TestVectorReport = {
      totalJunitFiles: 0,
      totalTestVectors: 1,
      totalJunitTestCases: 1,
      specTestCases: 1,
      specFailedTestCases: 1,
      specPassedTestCases: 0,
      specSkippedTestCases: 0,
      missingVectors: [],
      failedVectors: [tbdexKtErrorSample],
      skippedVectors: [],
      successVectors: []
    }

    const summary = generateSummary(report, '')

    expect(summary).toContain('Failed to resolve kid.')
  })
})
