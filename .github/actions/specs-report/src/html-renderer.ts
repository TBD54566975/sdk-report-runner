import { Eta } from 'eta'

import { ConformanceData, SdkAggregatedStatus } from './spec-release'
import { readGhPagesFile, writeGhPagesFile } from './gh-utils'

const SPEC_RELEASES_MATRIX_PLACEHOLDER_BEGIN =
  '<!-- spec-releases-matrix-begin -->'
const SPEC_RELEASES_MATRIX_PLACEHOLDER_END = '<!-- spec-releases-matrix-end -->'

export const handleHtmlReleaseMatrixWrite = async (
  gitToken: string
): Promise<void> => {
  const indexFile = await readGhPagesFile('index.html', gitToken)
  if (!indexFile) {
    throw new Error('Index file not found')
  }

  const { content: indexHtml, sha: indexSha } = indexFile

  const cleanHtml = removeLatestReleaseMatrix(indexHtml)

  const web5HtmlTable = await getConformanceHtmlTable('web5-spec', gitToken)
  const tbdexHtmlTable = await getConformanceHtmlTable('tbdex', gitToken)

  const specComplianceReport = `
    <hr/>
    <h1>Spec Releases Compliance Matrix</h1>
    <hr/>

    <h2>Web5 Spec Releases</h2>
    ${web5HtmlTable}
    <hr/>

    <h2>TBDEX Spec Releases</h2>
    ${tbdexHtmlTable}
    <hr/>
  `

  const finalHtml = insertSpecComplianceReport(cleanHtml, specComplianceReport)
  return writeFinalHtml(finalHtml, gitToken, indexSha)
}

const getConformanceHtmlTable = async (
  specType: 'web5-spec' | 'tbdex',
  gitToken: string
): Promise<string> => {
  const fileName = `./spec-conformance-${specType}.json`
  const file = await readGhPagesFile(fileName, gitToken)
  if (!file) {
    throw new Error(`Spec Conformance File ${fileName} not found`)
  }
  const conformanceData: ConformanceData = JSON.parse(file.content)
  return generateConformanceDataHTML(specType, conformanceData)
}

const removeLatestReleaseMatrix = (indexHtml: string): string => {
  const placeholderBeginIndex = indexHtml.indexOf(
    SPEC_RELEASES_MATRIX_PLACEHOLDER_BEGIN
  )
  const placeholderEndIndex = indexHtml.indexOf(
    SPEC_RELEASES_MATRIX_PLACEHOLDER_END
  )
  return (
    indexHtml.slice(
      0,
      placeholderBeginIndex + SPEC_RELEASES_MATRIX_PLACEHOLDER_BEGIN.length
    ) + indexHtml.slice(placeholderEndIndex)
  )
}

const insertSpecComplianceReport = (
  indexHtml: string,
  specComplianceReport: string
): string => {
  return indexHtml.replace(
    SPEC_RELEASES_MATRIX_PLACEHOLDER_BEGIN,
    SPEC_RELEASES_MATRIX_PLACEHOLDER_BEGIN + specComplianceReport
  )
}

const writeFinalHtml = async (
  finalHtml: string,
  gitToken: string,
  originalSha?: string
): Promise<void> => {
  return writeGhPagesFile(
    'index.html',
    finalHtml,
    gitToken,
    'Update Spec Releases Conformance Matrix',
    originalSha
  )
}

export const generateConformanceDataHTML = (
  specName: string,
  data: ConformanceData
): string => {
  const specReleases = data.specReleases

  // Extract the list of unique SDK names
  const sdksSet = new Set<string>()
  for (const spec of specReleases) {
    for (const sdkName of Object.keys(spec.sdks || {})) {
      sdksSet.add(sdkName)
    }
  }

  const sdksList = Array.from(sdksSet)
  sdksList.sort()

  const eta = new Eta({ views: './templates' })
  return eta.render('spec-conformance-table.eta', {
    specName,
    specReleases,
    sdksList,
    getStatusIcon
  })
}

const getStatusIcon = (status: SdkAggregatedStatus): string => {
  if (status === 'passed') {
    return '✅'
  } else if (status === 'failed') {
    return '❌'
  } else if (status === 'missing') {
    return '🚧'
  } else {
    return '?'
  }
}
