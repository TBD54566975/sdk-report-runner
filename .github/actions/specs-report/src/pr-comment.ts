import * as github from '@actions/github'
import * as core from '@actions/core'

export const addCommentToPr = async (
  summary: string,
  gitToken: string
): Promise<void> => {
  const event = github.context.eventName
  if (event !== 'pull_request' || !github.context.payload.pull_request) {
    core.info('Not a PR event, skipping comment...')
    return
  }

  const prNumber = github.context.payload.pull_request.number
  core.info(`Adding summary report comment to PR #${prNumber}`)

  if (!gitToken) {
    core.error('No git token found, skipping comment...')
    core.setFailed('No git token found to add the requested PR comment')
    return
  }

  const { owner, repo } = github.context.repo
  const octokit = github.getOctokit(gitToken)

  // check if theres an existing comment
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber
  })
  const summaryHeader = summary.split('\n')[0]
  const existingComment = comments.data.find(
    ({ user, body }) => body?.includes(summaryHeader) && user?.type === 'Bot'
  )

  if (existingComment) {
    core.info('Existing comment found, updating...')
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingComment.id,
      body: summary
    })
    core.info(`Comment updated ${existingComment.html_url}`)
  } else {
    core.info('No existing comment found, creating new one...')
    const { data: createdComment } = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: summary
    })
    core.info(`Comment created ${createdComment.html_url}`)
  }
}
