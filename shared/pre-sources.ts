import process from "node:process"
import { Interval } from "./consts"
import { typeSafeObjectFromEntries } from "./type.util"
import type { OriginSource, Source, SourceID } from "./types"

const Time = {
  Test: 1,
  Realtime: 2 * 60 * 1000,
  Fast: 5 * 60 * 1000,
  Default: Interval, // 10min
  Common: 30 * 60 * 1000,
  Slow: 60 * 60 * 1000,
}

export const originSources = {
  bbc: {
    name: "BBC",
    home: "https://www.bbc.com/",
    column: "world",
  },
  cnn: {
    name: "CNN",
    home: "https://edition.cnn.com/",
    column: "world",
  },
  engadget: {
    name: "Engadget",
    home: "https://www.engadget.com/",
    column: "tech",
  },
  forbes: {
    name: "Forbes",
    home: "https://www.forbes.com/",
    column: "entrepreneurship",
  },
  github: {
    name: "Github",
    home: "https://github.com/",
    column: "tech",
  },
  groundnews: {
    name: "Ground News",
    home: "https://ground.news/daily-briefing",
    column: "world",
  },
  hackernews: {
    name: "Hacker News",
    column: "tech",
    home: "https://news.ycombinator.com/",
  },
  nature: {
    name: "Nature",
    home: "https://www.nature.com/news",
    column: "science",
  },
  nytimes: {
    name: "NY Times",
    home: "https://www.nytimes.com/",
    column: "world",
  },
  sciencedaily: {
    name: "ScienceDaily",
    home: "https://www.sciencedaily.com/",
    column: "science",
  },
  techcrunch: {
    name: "TechCrunch",
    home: "https://techcrunch.com/",
    column: "tech",
  },
  wired: {
    name: "Wired",
    home: "https://www.wired.com/",
    column: "tech",
  },
  wsj: {
    name: "WSJ",
    home: "https://www.wsj.com/",
    column: "finance",
  },
  yahoo_finance: {
    name: "Yahoo Finance",
    home: "https://finance.yahoo.com/",
    column: "finance",
  },
  yc_blog: {
    name: "YC Blog",
    home: "https://www.ycombinator.com/blog",
    column: "entrepreneurship",
  },
} as const satisfies Record<string, OriginSource>

export function genSources() {
  const _: [SourceID, Source][] = []

  Object.entries(originSources).forEach(([id, source]: [any, OriginSource]) => {
    const parent = {
      name: source.name,
      disable: source.disable,
      desc: source.desc,
      column: source.column,
      home: source.home,
      interval: source.interval ?? Time.Default,
    }
    if (source.sub && Object.keys(source.sub).length) {
      Object.entries(source.sub).forEach(([subId, subSource], i) => {
        if (i === 0) {
          _.push([
            id,
            {
              redirect: `${id}-${subId}`,
              ...parent,
              ...subSource,
            },
          ] as [any, Source])
        }
        _.push([`${id}-${subId}`, { ...parent, ...subSource }] as [
          any,
          Source,
        ])
      })
    } else {
      _.push([
        id,
        {
          title: source.title,
          ...parent,
        },
      ])
    }
  })

  return typeSafeObjectFromEntries(
    _.filter(([_, v]) => {
      if (v.disable === "cf" && process.env.CF_PAGES) {
        return false
      } else {
        return v.disable !== true
      }
    }),
  )
}
