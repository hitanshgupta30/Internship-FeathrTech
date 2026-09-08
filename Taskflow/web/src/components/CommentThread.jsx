import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from './LoadingSpinner';

const CommentThread = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      setError('');
      const response = await axiosClient.get(`/tasks/${taskId}/comments`);
      setComments(response.data.data.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const response = await axiosClient.post(`/tasks/${taskId}/comments`, {
        body: newComment.trim()
      });

      setComments((prev) => [...prev, response.data.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-thread-section" style={{ marginTop: 'var(--space-6)' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span>Comments</span>
        <span className="badge badge-status-todo">
          {comments.length}
        </span>
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner message="Loading..." size="sm" />
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
          No comments yet.
        </p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.authorName}</span>
                <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
              </div>
              <div className="comment-body">{comment.body}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleAddComment} style={{ marginTop: 'var(--space-3)' }}>
        <div className="form-group">
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            required
            id="comment-input"
          ></textarea>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting || !newComment.trim()}
            id="submit-comment-btn"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentThread;
