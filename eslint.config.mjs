import { ourongxing, react } from "@ourongxing/eslint-config"

export default ourongxing({
  type: "app",
  ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "**/*.json"],
}).append(react({
  files: ["src/**"],
}))
