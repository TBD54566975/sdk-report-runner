import * as core from '@actions/core'
import { readActionInputs } from './action-inputs'
import { handleCIReport } from './ci'
import { handleSdkRelease, handleSpecRelease } from './spec-release'
import { handleHtmlReleaseMatrixWrite } from './html-renderer'

/**
 * The main function for the action.
 */
export async function run(): Promise<void> {
  try {
    const inputs = readActionInputs()
    const { releaseMode } = inputs

    if (inputs.htmlReportWrite) {
      await handleHtmlReleaseMatrixWrite(inputs.gitToken)
    } else if (releaseMode === 'none') {
      await handleCIReport(inputs)
    } else if (releaseMode === 'spec') {
      await handleSpecRelease(inputs)
    } else if (releaseMode === 'sdk') {
      await handleSdkRelease(inputs)
    } else {
      throw new Error('Unknown release mode')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
