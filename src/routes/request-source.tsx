import { createFileRoute } from "@tanstack/react-router"
import { RequestSource } from "~/components/request-source"

export const Route = createFileRoute("/request-source")({
  component: RequestSourceComponent,
})

function RequestSourceComponent() {
  return <RequestSource />
}
