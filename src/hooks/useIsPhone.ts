import { useMedia } from "react-use"

/** Matches Tailwind's `max-md`, so JS layout switches agree with the CSS ones. */
export function useIsPhone() {
  return useMedia("(max-width: 767px)")
}
