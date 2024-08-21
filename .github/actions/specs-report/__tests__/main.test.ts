/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as files from '../src/files'
import * as prComment from '../src/pr-comment'
import * as junit2json from 'junit2json'
import { TBDEX_TEST_VECTORS_FILES, SUCCESS_MOCK, FAILURE_MOCK } from './mocks'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let errorMock: jest.SpiedFunction<typeof core.error>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let summaryWriteMock: jest.SpiedFunction<typeof core.summary.write>

// Mock action used functions
let getFilesMock: jest.SpiedFunction<typeof files.getFiles>
let readJsonFileMock: jest.SpiedFunction<typeof files.readJsonFile>
let junitParseMock: jest.SpiedFunction<typeof junit2json.parse>
let addCommentToPrMock: jest.SpiedFunction<typeof prComment.addCommentToPr>

const defaultGetInputMockImplementation = (): void => {
  getInputMock.mockImplementation(name => {
    switch (name) {
      case 'junit-report-paths':
        return '500'
      case 'spec-path':
        return '500'
      case 'git-token':
        return 'fake-token'
      case 'comment-on-pr':
        return 'true'
      case 'fail-on-missing-vectors':
        return 'false'
      case 'fail-on-failed-test-cases':
        return 'true'
      default:
        return ''
    }
  })
}

const VALID_SPEC_JSON_BODY = {
  description: 'This is a valid tbdex spec',
  input: {},
  output: {}
}

describe('action', () => {
  let output: Record<string, string> = {}

  beforeEach(() => {
    jest.clearAllMocks()
    output = {}

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setOutputMock = jest
      .spyOn(core, 'setOutput')
      .mockImplementation((k, v) => (output[k] = v))
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    summaryWriteMock = jest.spyOn(core.summary, 'write').mockImplementation()

    getFilesMock = jest.spyOn(files, 'getFiles').mockImplementation()
    readJsonFileMock = jest.spyOn(files, 'readJsonFile').mockImplementation()

    addCommentToPrMock = jest
      .spyOn(prComment, 'addCommentToPr')
      .mockImplementation()

    junitParseMock = jest.spyOn(junit2json, 'parse')
  })

  it('generates a report without any failures', async () => {
    defaultGetInputMockImplementation()
    getFilesMock
      // get junit report xml first
      .mockReturnValueOnce(Promise.resolve(SUCCESS_MOCK.junitFiles))
      // get test vector json
      .mockReturnValueOnce(Promise.resolve(TBDEX_TEST_VECTORS_FILES))
    readJsonFileMock.mockReturnValue(VALID_SPEC_JSON_BODY)

    const rawJunitFile = files.readFile(SUCCESS_MOCK.junitFiles[0])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(junitParseMock).toHaveReturnedTimes(1)
    expect(junitParseMock).toHaveBeenCalledWith(rawJunitFile)

    console.info({ output })
    expect(setOutputMock).toHaveBeenCalled()
    expect(output.success).toBe('true')
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()

    expect(output.summary).toMatch('✅ All test vectors passed')
    expect(summaryWriteMock).toHaveBeenCalledTimes(1)

    expect(addCommentToPrMock).toHaveBeenCalledWith(
      output.summary,
      'fake-token'
    )

    const expectedReport = {
      totalJunitFiles: 1,
      totalTestVectors: 10,
      totalJunitTestCases: 99,
      specTestCases: 10,
      specFailedTestCases: 0,
      specPassedTestCases: 10,
      specSkippedTestCases: 0,
      ...SUCCESS_MOCK.vectors
    }
    console.info(output['test-vector-report'])
    const testVectorReport = JSON.parse(output['test-vector-report'])
    expect(testVectorReport).toEqual(expectedReport)
  })

  it('generates a report with failures', async () => {
    defaultGetInputMockImplementation()
    getFilesMock
      // get junit report xml first
      .mockReturnValueOnce(Promise.resolve(FAILURE_MOCK.junitFiles))
      // get test vector json
      .mockReturnValueOnce(Promise.resolve(TBDEX_TEST_VECTORS_FILES))
    readJsonFileMock.mockReturnValue(VALID_SPEC_JSON_BODY)

    const rawJunitFile = files.readFile(FAILURE_MOCK.junitFiles[0])

    await main.run()
    expect(runMock).toHaveReturned()

    expect(junitParseMock).toHaveReturnedTimes(1)
    expect(junitParseMock).toHaveBeenCalledWith(rawJunitFile)

    console.info({ output })
    expect(setOutputMock).toHaveBeenCalled()
    expect(output.success).not.toBeDefined()
    expect(setFailedMock).toHaveBeenCalledWith('❌ Failed test vectors found')
    expect(errorMock).not.toHaveBeenCalled()

    expect(output.summary).toMatch(
      '7 out of 10 test vectors passed successfully'
    )
    expect(summaryWriteMock).toHaveBeenCalledTimes(1)

    const expectedReport = {
      totalJunitFiles: 1,
      totalTestVectors: 10,
      totalJunitTestCases: 97,
      specTestCases: 8,
      specFailedTestCases: 1,
      specPassedTestCases: 7,
      specSkippedTestCases: 0,
      ...FAILURE_MOCK.vectors
    }
    console.info(output['test-vector-report'])
    const testVectorReport = JSON.parse(output['test-vector-report'])
    expect(testVectorReport).toEqual(expectedReport)
  })
})
