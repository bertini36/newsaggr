import process from "node:process"
import { SignJWT } from "jose"
import { UserTable } from "#/database/user"

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const userTable = db ? new UserTable(db) : undefined
  if (!userTable) throw new Error("db is not defined")
  if (process.env.INIT_TABLE !== "false") await userTable.init()

  const code = getQuery(event).code as string
  const requestURL = getRequestURL(event)
  const redirectUri = `${requestURL.origin}/api/oauth/google`

  // Exchange authorization code for access token
  const tokenResponse = await myFetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    },
  )

  const { access_token } = tokenResponse as { access_token: string }

  // Fetch user information from Google
  const userInfo: {
    id?: string
    sub: string
    email: string
    name: string
    picture: string
  } = await myFetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  const userID = userInfo.id || userInfo.sub
  if (!userID) {
    logger.error("No user ID found in Google response", userInfo)
    throw new Error("Failed to get user ID from Google")
  }
  await userTable.addUser(userID, userInfo.email, "google", "")

  const jwtToken = await new SignJWT({
    id: userID,
    type: "google",
  })
    .setExpirationTime("60d")
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

  const params = new URLSearchParams({
    login: "google",
    jwt: jwtToken,
    user: JSON.stringify({
      avatar: userInfo.picture,
      name: userInfo.name,
      type: "google",
    }),
  })
  return sendRedirect(event, `/?${params.toString()}`)
})
