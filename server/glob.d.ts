/* eslint-disable */

declare module 'glob:./sources/{*.ts,**/index.ts}' {
  export const ainews_smol: typeof import('./sources/ainews_smol')
  export const arxiv_ai: typeof import('./sources/arxiv_ai')
  export const bbc: typeof import('./sources/bbc')
  export const cnn: typeof import('./sources/cnn')
  export const eldiario: typeof import('./sources/eldiario')
  export const elmundo: typeof import('./sources/elmundo')
  export const elpais: typeof import('./sources/elpais')
  export const engadget: typeof import('./sources/engadget')
  export const forbes: typeof import('./sources/forbes')
  export const github: typeof import('./sources/github')
  export const groundnews: typeof import('./sources/groundnews')
  export const hackernews: typeof import('./sources/hackernews')
  export const nature: typeof import('./sources/nature')
  export const nytimes: typeof import('./sources/nytimes')
  export const sciencedaily: typeof import('./sources/sciencedaily')
  export const techcrunch: typeof import('./sources/techcrunch')
  export const wired: typeof import('./sources/wired')
  export const wsj: typeof import('./sources/wsj')
  export const yahoo_finance: typeof import('./sources/yahoo_finance')
  export const yc_blog: typeof import('./sources/yc_blog')
}
