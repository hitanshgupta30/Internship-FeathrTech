import { Link, useParams } from 'react-router-dom'

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Designer' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'Developer' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'Tester' },
]

function UserDetails() {
  const { id } = useParams()
  const userId = Number(id)
  const userExists = users.some((person) => person.id === userId)

  if (!userExists) {
    return <p className="user-placeholder">User not found.</p>
  }

  return (
    <div className="user-details">
      <div className="detail-header">
        <h3>User Details</h3>
        <Link to="/users" className="close-button">
          Close
        </Link>
      </div>
      <p>This is user: {userId}</p>
    </div>
  )
}

export default UserDetails
