import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import api from "../api.js";
import "../styles/Comments.css";

function Comments({ pitchId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [pitchId]);

  async function loadComments() {
    try {
      const data = await api.getComments(pitchId);
      setComments(data);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await api.createComment({ pitchId, text: newComment });
      setNewComment("");
      loadComments();
    } catch {
      // Error
    } finally {
      setPosting(false);
    }
  }

  async function handleReply(parentId) {
    if (!replyText.trim()) return;
    try {
      await api.createComment({ pitchId, text: replyText, parentId });
      setReplyingTo(null);
      setReplyText("");
      loadComments();
    } catch {
      // Error
    }
  }

  async function handleEdit(commentId) {
    if (!editText.trim()) return;
    try {
      await api.updateComment(commentId, { text: editText });
      setEditingId(null);
      setEditText("");
      loadComments();
    } catch {
      // Error
    }
  }

  async function handleDelete(commentId) {
    try {
      await api.deleteComment(commentId);
      loadComments();
    } catch {
      // Error
    }
  }

  // Organize comments: top-level + replies
  const topLevel = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  function getReplies(parentId) {
    return replies.filter(
      (r) => r.parentId.toString() === parentId.toString()
    );
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3 className="pitch-section-title" style={{ marginBottom: 0 }}>
          Q&A
        </h3>
        <span className="comments-count">{comments.length} comments</span>
      </div>

      {user && (
        <div className="comment-form">
          <textarea
            placeholder="Ask a question or leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handlePost}
            disabled={posting || !newComment.trim()}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      )}

      {!user && (
        <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.9rem" }}>
          <Link to="/login">Sign in</Link> to ask questions or comment.
        </p>
      )}

      {loading ? (
        <div className="no-comments loading-pulse">Loading comments...</div>
      ) : topLevel.length === 0 ? (
        <div className="no-comments">
          No comments yet. Be the first to ask a question!
        </div>
      ) : (
        <div className="comment-list">
          {topLevel.map((comment) => (
            <div key={comment._id}>
              <div className="comment-item">
                <div className="comment-top">
                  <div className="comment-author">
                    <Link
                      to={`/users/${comment.authorId}`}
                      className="comment-author-name"
                    >
                      {comment.authorName}
                    </Link>
                    {comment.isAuthorReply && (
                      <span className="comment-author-badge">Author</span>
                    )}
                  </div>
                  <span className="comment-date">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {editingId === comment._id ? (
                  <div className="edit-form">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                    />
                    <div className="edit-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(comment._id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}

                <div className="comment-actions">
                  {user && (
                    <button
                      className="comment-action-btn"
                      onClick={() => {
                        setReplyingTo(
                          replyingTo === comment._id ? null : comment._id
                        );
                        setReplyText("");
                      }}
                    >
                      Reply
                    </button>
                  )}
                  {user && user._id === comment.authorId.toString() && (
                    <>
                      <button
                        className="comment-action-btn"
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditText(comment.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="comment-action-btn delete"
                        onClick={() => handleDelete(comment._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {replyingTo === comment._id && (
                  <div className="reply-form">
                    <textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleReply(comment._id)}
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>

              {getReplies(comment._id).map((reply) => (
                <div className="comment-item is-reply" key={reply._id}>
                  <div className="comment-top">
                    <div className="comment-author">
                      <Link
                        to={`/users/${reply.authorId}`}
                        className="comment-author-name"
                      >
                        {reply.authorName}
                      </Link>
                      {reply.isAuthorReply && (
                        <span className="comment-author-badge">Author</span>
                      )}
                    </div>
                    <span className="comment-date">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>

                  {editingId === reply._id ? (
                    <div className="edit-form">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                      />
                      <div className="edit-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEdit(reply._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-text">{reply.text}</p>
                  )}

                  {user && user._id === reply.authorId.toString() && (
                    <div className="comment-actions">
                      <button
                        className="comment-action-btn"
                        onClick={() => {
                          setEditingId(reply._id);
                          setEditText(reply.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="comment-action-btn delete"
                        onClick={() => handleDelete(reply._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Comments.propTypes = {
  pitchId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    displayName: PropTypes.string,
  }),
};

export default Comments;
