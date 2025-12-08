/* eslint-disable */

declare module 'glob:./sources/{*.ts,**/index.ts}' {
  export const bbc: typeof import('./sources/bbc')
  export const cnn: typeof import('./sources/cnn')
  export const engadget: typeof import('./sources/engadget')
  export const github: typeof import('./sources/github')
  export const groundnews: typeof import('./sources/groundnews')
  export const hackernews: typeof import('./sources/hackernews')
  export const nature: typeof import('./sources/nature')
  export const nytimes: typeof import('./sources/nytimes')
  export const techcrunch: typeof import('./sources/techcrunch')
  export const wired: typeof import('./sources/wired')
}
