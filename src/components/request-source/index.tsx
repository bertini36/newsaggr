import { useTitle } from "react-use"
import { Link, useNavigate } from "@tanstack/react-router"
import { columns } from "@shared/metadata"
import { safeParseString } from "~/utils"

function LoginPrompt() {
  const { loginWithGoogle, loginWithGithub, providers } = useLogin()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="i-ph:sign-in text-6xl text-neutral-300 dark:text-neutral-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-neutral-600 dark:text-neutral-300">
        Login required
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
        Please log in to request a new source.
      </p>
      <div className="flex gap-3">
        {providers.google && (
          <button
            type="button"
            onClick={loginWithGoogle}
            className={$([
              "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors",
              "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
              "hover:bg-neutral-700 dark:hover:bg-neutral-200",
            ])}
          >
            <span className="i-ph:google-logo" />
            Login with Google
          </button>
        )}
        {providers.github && (
          <button
            type="button"
            onClick={loginWithGithub}
            className={$([
              "flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors",
              "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
              "hover:bg-neutral-700 dark:hover:bg-neutral-200",
            ])}
          >
            <span className="i-ph:github-logo" />
            Login with GitHub
          </button>
        )}
      </div>
    </div>
  )
}

// Get category options from metadata (excluding "focus")
const categoryOptions = Object.entries(columns)
  .filter(([key]) => key !== "focus")
  .map(([key, value]) => ({
    value: key,
    label: value.zh,
  }))

export function RequestSource() {
  useTitle("Request source - NewsAggr")

  const { loggedIn } = useLogin()
  const navigate = useNavigate()
  const toast = useToast()

  const [sourceName, setSourceName] = useState("")
  const [category, setCategory] = useState("")
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!sourceName.trim() || !category || !url.trim()) {
      setError("Please fill in all fields")
      return
    }

    // Basic URL validation
    if (!URL.canParse(url)) {
      setError("Please enter a valid URL")
      return
    }

    setIsSubmitting(true)

    try {
      const jwt = safeParseString(localStorage.getItem("jwt"))
      if (!jwt) {
        setError("Not logged in")
        setIsSubmitting(false)
        return
      }
      const response = await myFetch("/me/source-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          sourceName: sourceName.trim(),
          category,
          url: url.trim(),
        }),
      })

      if (response.success) {
        toast("Source request submitted successfully!")
        navigate({ to: "/" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }, [sourceName, category, url, toast, navigate])

  if (!loggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <LoginPrompt />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="i-ph:plus-circle text-neutral-600 dark:text-neutral-400" />
          Request source
        </h1>
      </div>

      <div
        className={$([
          "p-6 rounded-lg",
          "bg-white dark:bg-github-card",
          "border border-neutral-200 dark:border-github-border",
        ])}
      >
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Request a new news source to be added to NewsAggr. We'll review your request and add it if it meets our criteria.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Source Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="sourceName" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Source Name
            </label>
            <input
              id="sourceName"
              type="text"
              value={sourceName}
              onChange={e => setSourceName(e.target.value)}
              placeholder="e.g. TechCrunch, El País..."
              className={$([
                "px-4 py-2 rounded-md",
                "bg-neutral-50 dark:bg-neutral-800",
                "border border-neutral-200 dark:border-neutral-700",
                "text-neutral-900 dark:text-white",
                "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600",
              ])}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Category
            </label>
            <input
              id="category"
              type="text"
              list="category-options"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Select or type a category..."
              className={$([
                "px-4 py-2 rounded-md",
                "bg-neutral-50 dark:bg-neutral-800",
                "border border-neutral-200 dark:border-neutral-700",
                "text-neutral-900 dark:text-white",
                "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600",
              ])}
            />
            <datalist id="category-options">
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.label} />
              ))}
            </datalist>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-2">
            <label htmlFor="url" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Link
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/news"
              className={$([
                "px-4 py-2 rounded-md",
                "bg-neutral-50 dark:bg-neutral-800",
                "border border-neutral-200 dark:border-neutral-700",
                "text-neutral-900 dark:text-white",
                "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600",
              ])}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={$([
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors",
                "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
                "hover:bg-neutral-700 dark:hover:bg-neutral-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ])}
            >
              {isSubmitting
                ? (
                    <>
                      <span className="i-ph:circle-dashed animate-spin" />
                      Submitting...
                    </>
                  )
                : (
                    <>
                      <span className="i-ph:paper-plane-tilt" />
                      Submit request
                    </>
                  )}
            </button>
            <Link
              to="/"
              className={$([
                "px-4 py-2 rounded-md cursor-pointer transition-colors",
                "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                "hover:bg-neutral-200 dark:hover:bg-neutral-700",
              ])}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
