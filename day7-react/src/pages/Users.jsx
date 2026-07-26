import { useEffect, useState } from 'react'

function Users() {
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const maxLength = 100

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts')

        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await response.json()
        setPosts(data.slice(0, 10))
        setFetchError(false)
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSearch = (event) => {
    const value = event.target.value
    setSearch(value)

    if (value.trim() === '') {
      setError('Please enter a name to search.')
    } else {
      setError('')
    }
  }

  return (
    <div className="page">
      <h2>Posts Page</h2>
      <p>Showing the first 10 posts from the API.</p>

      <div className="search-row">
        <input
          type="text"
          placeholder="Search posts by title"
          value={search}
          onChange={handleSearch}
          className="search-input"
          maxLength={maxLength + 10}
        />
        <span className={`char-counter ${search.length > maxLength ? 'over-limit' : ''}`}>
          {search.length}/{maxLength}
        </span>
      </div>

      {error && <p className="search-error">{error}</p>}

      {loading && <p className="user-placeholder">Loading...</p>}

      {!loading && fetchError && <p className="search-error">Something went wrong</p>}

      {!loading && !fetchError && (
        <div className="user-list">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="user-card">
                <strong>{post.title}</strong>
                <span>{post.body}</span>
              </div>
            ))
          ) : (
            <p className="user-placeholder">No posts found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Users
