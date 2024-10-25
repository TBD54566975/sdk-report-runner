import * as github from '@actions/github'
import * as core from '@actions/core'

export const readGhPagesFile = async (
  fileName: string,
  gitToken: string
): Promise<
  | {
      content: string
      sha: string
    }
  | undefined
> => {
  try {
    const reportRepo = github.context.repo
    const octokit = github.getOctokit(gitToken)

    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: reportRepo.owner,
      repo: reportRepo.repo,
      path: fileName,
      ref: 'gh-pages'
    })
    if ('content' in fileData) {
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
      return { content, sha: fileData.sha }
    } else {
      throw new Error('Unexpected response format')
    }
  } catch (error) {
    if ((error as { status: number }).status === 404) {
      return undefined
    }
    core.error(`GH Pages File read failure: ${error}`)
    throw error
  }
}

export const writeGhPagesFile = async (
  fileName: string,
  content: string,
  gitToken: string,
  message: string,
  originalSha?: string
): Promise<void> => {
  const isTest = process.env.SKIP_WRITE_CONFORMANCE_JSON === 'true'

  if (!isTest) {
    const reportRepo = github.context.repo
    const octokit = github.getOctokit(gitToken)
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: reportRepo.owner,
      repo: reportRepo.repo,
      path: fileName,
      message,
      content: Buffer.from(content).toString('base64'),
      sha: originalSha,
      branch: 'gh-pages'
    })
  } else {
    core.info(`Test mode, skipping write to ${fileName}...`)
  }
}
