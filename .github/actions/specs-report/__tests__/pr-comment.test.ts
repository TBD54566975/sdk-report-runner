import * as core from '@actions/core'
import * as github from '@actions/github'
import { addCommentToPr } from '../src/pr-comment'

// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>
let errorMock: jest.SpiedFunction<typeof core.error>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

// Mock Octokit
const mockOctokit = {
  rest: {
    issues: {
      listComments: jest.fn(),
      updateComment: jest.fn(),
      createComment: jest.fn()
    }
  }
}

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn().mockImplementation(() => mockOctokit),
  context: {
    eventName: 'pull_request',
    payload: { pull_request: { number: 123 } },
    repo: { owner: 'test-owner', repo: 'test-repo' }
  }
}))

describe('addCommentToPr', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

    // Reset github.context for each test
    Object.defineProperty(github.context, 'repo', {
      get: jest.fn(() => ({ owner: 'test-owner', repo: 'test-repo' })),
      configurable: true
    })
  })

  it('skips commenting if not a PR event', async () => {
    github.context.eventName = 'push'
    github.context.payload = {}

    await addCommentToPr('Test summary', 'fake-token', '')

    expect(infoMock).toHaveBeenCalledWith('Not a PR event, skipping comment...')
    expect(mockOctokit.rest.issues.listComments).not.toHaveBeenCalled()
  })

  it('fails if no git token is provided', async () => {
    github.context.eventName = 'pull_request'
    github.context.payload = { pull_request: { number: 123 } }
    Object.defineProperty(github.context, 'repo', {
      value: {},
      writable: true
    })

    await addCommentToPr('Test summary', '', '')

    expect(errorMock).toHaveBeenCalledWith(
      'No git token found, skipping comment...'
    )
    expect(setFailedMock).toHaveBeenCalledWith(
      'No git token found to add the requested PR comment'
    )
    expect(mockOctokit.rest.issues.listComments).not.toHaveBeenCalled()
  })

  it('updates an existing comment if found', async () => {
    const existingComment = {
      id: 456,
      body: 'Header summary\nOld content',
      user: { type: 'Bot' },
      html_url:
        'https://github.com/test-owner/test-repo/pull/123#issuecomment-456'
    }

    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [existingComment]
    })

    const newSummary = 'Header summary\nNew content'
    await addCommentToPr(newSummary, 'fake-token', '')

    expect(mockOctokit.rest.issues.listComments).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 123
    })

    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      comment_id: 456,
      body: newSummary
    })

    expect(infoMock).toHaveBeenCalledWith('Existing comment found, updating...')
    expect(infoMock).toHaveBeenCalledWith(
      `Comment updated ${existingComment.html_url}`
    )
  })

  it('creates a new comment if no existing comment is found', async () => {
    const newComment = {
      html_url:
        'https://github.com/test-owner/test-repo/pull/123#issuecomment-789'
    }

    mockOctokit.rest.issues.createComment.mockResolvedValue({
      data: newComment
    })

    mockOctokit.rest.issues.listComments.mockResolvedValue({ data: [] })

    const newSummary = 'New summary\nNew content'
    await addCommentToPr(newSummary, 'fake-token', '')

    expect(mockOctokit.rest.issues.listComments).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 123
    })

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 123,
      body: newSummary
    })

    expect(infoMock).toHaveBeenCalledWith(
      'No existing comment found, creating new one...'
    )
    expect(infoMock).toHaveBeenCalledWith(
      `Comment created ${newComment.html_url}`
    )
  })

  it('creates a new comment with commentPackage', async () => {
    mockOctokit.rest.issues.listComments.mockResolvedValue({ data: [] })
    mockOctokit.rest.issues.createComment.mockResolvedValue({
      data: {
        html_url:
          'https://github.com/test-owner/test-repo/pull/123#issuecomment-789'
      }
    })

    const summary = 'Test summary\nContent'
    const commentPackage = 'TestPackage'
    await addCommentToPr(summary, 'fake-token', commentPackage)

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 123,
      body: `${commentPackage}: ${summary}`
    })
  })

  it('updates an existing comment with commentPackage', async () => {
    const existingComment = {
      id: 456,
      body: 'TestPackage: Summary Header\nOld content',
      user: { type: 'Bot' },
      html_url:
        'https://github.com/test-owner/test-repo/pull/123#issuecomment-456'
    }

    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [existingComment]
    })

    const summary = 'Summary Header\nNew content'
    const commentPackage = 'TestPackage'
    await addCommentToPr(summary, 'fake-token', commentPackage)

    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      comment_id: 456,
      body: `${commentPackage}: ${summary}`
    })
  })
})
