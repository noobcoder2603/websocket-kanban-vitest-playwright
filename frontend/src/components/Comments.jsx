import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5002");

const Comments = () => {
  const { category, id } = useParams();
  const commentRef = useRef(null);
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    socket.emit("fetchComments", { category, id });

    socket.on("comments", (data) => setCommentList(data));

    return () => {
      socket.off("comments");
    };
  }, [category, id]);

  const addComment = (e) => {
    e.preventDefault();
    socket.emit("addComment", {
      comment: commentRef.current.value,
      category,
      id,
      userId: localStorage.getItem("userID"),
    });
    commentRef.current.value = "";
  };

  return (
    <div className="comments__container">
      <form className="comment__form" onSubmit={addComment}>
        <label htmlFor="comment">Add a comment</label>
        <textarea
          placeholder="Type your comment..."
          ref={commentRef}
          rows={5}
          id="comment"
          name="comment"
          required
        ></textarea>
        <button className="commentBtn">ADD COMMENT</button>
      </form>
      <div className="comments__section">
        <h2>Existing Comments</h2>
        {commentList?.map((comment) => (
          <div key={comment.id}>
            <p>
              <span style={{ fontWeight: "bold" }}>{comment.text} </span>by{" "}
              {comment.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;