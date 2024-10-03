import { Eta } from 'eta'

import { ConformanceData, SdkAggregatedStatus } from './spec-release'

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
