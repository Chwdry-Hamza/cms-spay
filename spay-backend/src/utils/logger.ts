/* eslint-disable no-console */
const ts = () => new Date().toISOString().replace('T', ' ').replace(/\..+/, '');

export const logger = {
  info:  (...args: unknown[]) => console.log(`[${ts()}]`, '\x1b[36mINFO\x1b[0m ', ...args),
  warn:  (...args: unknown[]) => console.warn(`[${ts()}]`, '\x1b[33mWARN\x1b[0m ', ...args),
  error: (...args: unknown[]) => console.error(`[${ts()}]`, '\x1b[31mERROR\x1b[0m', ...args),
  debug: (...args: unknown[]) => console.debug(`[${ts()}]`, '\x1b[90mDEBUG\x1b[0m', ...args),
};
