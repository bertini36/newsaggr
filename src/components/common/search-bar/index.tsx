import { Command } from "cmdk"
import { useMount } from "react-use"
import type { SourceID } from "@shared/types"
import { useMemo, useRef, useState } from "react"
import pinyin from "@shared/pinyin.json"
import { OverlayScrollbar } from "../overlay-scrollbar"
import { CardWrapper } from "~/components/column/card"
import { DARK_MODE_INVERT_LOGOS } from "~/utils"

import "./cmdk.css"

interface SourceItemProps {
  id: SourceID
  name: string
  title?: string
  column: any
  pinyin: string
}

function groupByColumn(items: SourceItemProps[]) {
  return items.reduce((acc, item) => {
    const k = acc.find(i => i.column === item.column)
    if (k) k.sources = [...k.sources, item]
    else acc.push({ column: item.column, sources: [item] })
    return acc
  }, [] as {
    column: string
    sources: SourceItemProps[]
  }[]).sort((m, n) => m.column.localeCompare(n.column))
}

export function SearchBar() {
  const { opened, toggle } = useSearchBar()
  const sourceItems = useMemo(
    () =>
      groupByColumn(typeSafeObjectEntries(sources)
        .filter(([_, source]) => !source.redirect)
        .map(([k, source]) => ({
          id: k,
          title: source.title,
          column: source.column ? columns[source.column].zh : "Uncategorized",
          name: source.name,
          pinyin: pinyin?.[k as keyof typeof pinyin] ?? "",
        })))
    , [],
  )
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [value, setValue] = useState<SourceID>("github")

  useMount(() => {
    inputRef?.current?.focus()
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener("keydown", keydown)
    return () => {
      document.removeEventListener("keydown", keydown)
    }
  })

  return (
    <Command.Dialog
      open={opened}
      onOpenChange={toggle}
      value={value}
      onValueChange={(v) => {
        if (v in sources) {
          setValue(v as SourceID)
        }
      }}
    >
      <Command.Input
        ref={inputRef}
        autoFocus
        placeholder="Search what you want"
      />
      <div className="md:flex">
        <OverlayScrollbar defer className="overflow-y-auto md:min-w-275px border-r border-[#d4d4d4] dark:border-github-border">
          <Command.List>
            <Command.Empty> Not found, you can submit an issue on Github </Command.Empty>
            {
              sourceItems.map(({ column, sources }) => (
                <Command.Group heading={column} key={column}>
                  {
                    sources.map(item => <SourceItem item={item} key={item.id} onHover={setValue} />)
                  }
                </Command.Group>
              ),
              )
            }
          </Command.List>
        </OverlayScrollbar>
        <div className="flex-1 p-4 min-w-350px max-md:hidden">
          <CardWrapper id={value} />
        </div>
      </div>
    </Command.Dialog>
  )
}

function SourceItem({ item, onHover }: {
  item: SourceItemProps
  onHover: (id: SourceID) => void
}) {
  const { isFocused, toggleFocus } = useFocusWith(item.id)
  return (
    <Command.Item
      keywords={[item.name, item.title ?? "", item.pinyin]}
      value={item.id}
      className="flex justify-between items-center p-2 cursor-pointer [&_*]:cursor-pointer"
      onSelect={toggleFocus}
      onMouseEnter={() => onHover(item.id)}
      title={isFocused ? "Remove from focus" : "Add to Focus"}
    >
      <span className="flex gap-2 items-center">
        <span
          className={$("w-4 h-4 bg-cover", DARK_MODE_INVERT_LOGOS.includes(item.id.split("-")[0]) && "dark:invert")}
          style={{
            backgroundImage: `url(/icons/${item.id.split("-")[0]}.png)`,
          }}
        />
        <span>{item.name}</span>
        <span className="text-xs text-neutral-400/80 self-end mb-3px">{item.title}</span>
      </span>
      <span className={$(isFocused ? "i-ph-star-fill bg-red-400" : "i-ph-star bg-neutral-400")}></span>
    </Command.Item>
  )
}
