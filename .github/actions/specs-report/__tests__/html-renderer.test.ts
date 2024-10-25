import {
  generateConformanceDataHTML,
  handleHtmlReleaseMatrixWrite
} from '../src/html-renderer'
import { ConformanceData } from '../src/spec-release'

import * as ghUtils from '../src/gh-utils'
import fs from 'fs'

import exampleConformanceDataSimple from './assets/example-spec-conformance-web5-simple.json'
import exampleConformanceDataComplex from './assets/example-spec-conformance-web5-complex.json'
import tbdexSpecConformanceDataEmpty from './assets/example-spec-conformance-tbdex-empty.json'

// Mock Octokit
const mockOctokit = {
  rest: {
    repos: {
      createOrUpdateFileContents: jest.fn(),
      getContent: jest.fn()
    }
  }
}

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn().mockImplementation(() => mockOctokit),
  context: {
    eventName: 'pull_request',
    payload: { pull_request: { number: 123 } },
    repo: { owner: 'TBD54566975', repo: 'sdk-report-runner' }
  }
}))

describe('generateConformanceDataHTML', () => {
  it('should generate the final HTML with the spec releases matrix', async () => {
    const indexSourceHtml = fs.readFileSync(
      `${__dirname}/assets/report-index-sample.html`,
      'utf8'
    )

    const expectedFinalHtml = fs.readFileSync(
      `${__dirname}/assets/expected-report-index-with-matrix.html`,
      'utf8'
    )

    const tbdexSpecConformanceData =
      tbdexSpecConformanceDataEmpty as unknown as ConformanceData

    const web5SpecConformanceData =
      exampleConformanceDataComplex as unknown as ConformanceData

    // mock the gh-utils/readGhPagesFile 3 times
    // 1. for the index.html
    // 2. for the web5-spec conformance data
    // 3. for the tbdex conformance data
    jest
      .spyOn(ghUtils, 'readGhPagesFile')
      .mockImplementationOnce(async () => ({
        content: indexSourceHtml,
        sha: 'mockSha'
      }))
      .mockImplementationOnce(async () => ({
        content: JSON.stringify(web5SpecConformanceData),
        sha: 'mockSha'
      }))
      .mockImplementationOnce(async () => ({
        content: JSON.stringify(tbdexSpecConformanceData),
        sha: 'mockSha'
      }))

    const writeGhPagesFileMock = jest.spyOn(ghUtils, 'writeGhPagesFile')

    await handleHtmlReleaseMatrixWrite('mockGitToken', 'index.html')

    expect(writeGhPagesFileMock).toHaveBeenCalledWith(
      'index.html',
      expectedFinalHtml,
      'mockGitToken',
      'Update Spec Releases Conformance Matrix',
      'mockSha'
    )
  })

  it('should generate correct HTML table from conformance data', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataSimple as ConformanceData

    const result = generateConformanceDataHTML('web5-spec', conformanceData)

    // Check for table structure
    expect(result).toContain(
      '<table role="grid" aria-label="web5-spec Conformance Table">'
    )
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')

    // Check for header row
    expect(result).toContain('<th scope="col">Specification</th>')
    expect(result).toContain('<th scope="col">web5-rs</th>')
    expect(result).toContain('<th scope="col">web5-core-kt</th>')

    // Check for specification details
    expect(result).toContain('v0.3.1-alpha</a>')
    expect(result).toContain(
      'https://github.com/TBD54566975/web5-spec/releases/tag/v0.3.1-alpha'
    )
    expect(result).toContain(
      'https://github.com/TBD54566975/web5-spec/tree/v0.3.1-alpha/test-vectors'
    )

    // Check for SDK details
    expect(result).toContain('v4.0.0</a>')
    expect(result).toContain(
      'https://github.com/TBD54566975/web5-rs/releases/tag/v4.0.0'
    )
  })

  it('should generate the exact HTML table from Simple conformance data', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataSimple as ConformanceData

    const result = generateConformanceDataHTML('web5-spec', conformanceData)

    const expectedHTML = fs.readFileSync(
      `${__dirname}/assets/example-spec-conformance-table-web5-simple.html`,
      'utf8'
    )

    expect(result).toBe(expectedHTML)
  })

  it('should generate the exact HTML table from Complex conformance data', () => {
    const conformanceData: ConformanceData =
      exampleConformanceDataComplex as unknown as ConformanceData

    const result = generateConformanceDataHTML('web5-spec', conformanceData)

    const expectedHTML = fs.readFileSync(
      `${__dirname}/assets/example-spec-conformance-table-web5-complex.html`,
      'utf8'
    )

    expect(result).toBe(expectedHTML)
  })

  it('should generate correct HTML table with missing SDKs versions', () => {
    const conformanceData =
      exampleConformanceDataComplex as unknown as ConformanceData

    const result = generateConformanceDataHTML('web5-spec', conformanceData)

    // Check for header row
    expect(result).toContain('<th scope="col">Specification</th>')
    expect(result).toContain('<th scope="col">web5-rs</th>')
    expect(result).toContain('<th scope="col">web5-core-kt</th>')

    // Check for SDK details
    expect(result).toContain('v3.1.2</a>')

    // Check for missing SDK data
    expect(result).toContain('<td>-</td>')
  })

  it('should handle empty conformance data', () => {
    const emptyConformanceData: ConformanceData = { specReleases: [] }

    const result = generateConformanceDataHTML(
      'web5-spec',
      emptyConformanceData
    )

    expect(result).toContain(
      '<table role="grid" aria-label="web5-spec Conformance Table">'
    )
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('<tbody>')
    expect(result).not.toContain('Test Vectors</a>')
  })

  it('should handle conformance data with no SDKs', () => {
    const noSdksConformanceData: ConformanceData = {
      specReleases: [
        {
          version: 'v1.0.0',
          releaseLink: 'https://example.com/release',
          testVectors: {
            srcLink: 'https://example.com/test-vectors',
            cases: {}
          },
          sdks: {}
        }
      ]
    }

    const result = generateConformanceDataHTML(
      'web5-spec',
      noSdksConformanceData
    )

    expect(result).toContain(
      '<table role="grid" aria-label="web5-spec Conformance Table">'
    )
    expect(result).toContain('</table>')
    expect(result).toContain('<thead>')
    expect(result).toContain('v1.0.0</a>')
    expect(result).not.toContain('<th>web5-rs</th>')
    expect(result).not.toContain('<th>web5-core-kt</th>')
  })
})
