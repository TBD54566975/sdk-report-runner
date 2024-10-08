import * as core from '@actions/core'
import * as glob from '@actions/glob'
import { readFileSync, statSync } from 'fs'

/**
 * Retrieves a list of existing files based on the input glob pattern.
 * @returns A promise that resolves to an array of file paths.
 */
export const getFiles = async (paths: string | string[]): Promise<string[]> => {
  const globPattern = Array.isArray(paths) ? paths.join('\n') : paths
  const globber = await glob.create(globPattern)
  const files = (await globber.glob()).filter(f => statSync(f).isFile())
  core.info(`Got ${files.length} files ...`)
  core.info(files.join('\n'))
  return files
}

/** Retrieves a file text string from the given path. */
export const readFile = (file: string): string => {
  return readFileSync(file, 'utf8')
}

/** Retrieves a parsed JSON file from the given path. */
export const readJsonFile = (file: string): unknown => {
  return JSON.parse(readFile(file))
}
