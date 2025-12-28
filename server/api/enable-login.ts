import process from "node:process"

export default defineEventHandler(async () => {
  return {
    enable: true,
    providers: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      github: !!(process.env.G_CLIENT_ID && process.env.G_CLIENT_SECRET),
    },
  }
})
