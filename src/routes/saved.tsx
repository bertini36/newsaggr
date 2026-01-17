import { createFileRoute } from "@tanstack/react-router"
import { Bookmarks } from "~/components/bookmarks"

export const Route = createFileRoute("/saved")({
  component: SavedComponent,
})

function SavedComponent() {
  return <Bookmarks />
}
