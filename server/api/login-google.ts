import process from "node:process"

export default defineEventHandler(async (event) => {
  const requestURL = getRequestURL(event)
  const redirectUri = `${requestURL.origin}/api/oauth/google`

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
  })

  sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})
