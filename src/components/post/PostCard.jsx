import { useState } from "react";
import { FaThumbsUp, FaRegCommentDots, FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import CommentSection from "./CommentSection";
import toast from "react-hot-toast";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [liked, setLiked] = useState(post.isLiked || false); 
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [currentText, setCurrentText] = useState(post.text);

  // Safely get logged in user to verify ownership
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const isOwner = (currentUser._id || currentUser.id) === (post.author?._id || post.author?.id) || localStorage.getItem("role") === "admin";

  const handleLike = async () => {
    // Optimistic UI updates
    const wasLiked = liked;
    const prevLikes = likes;
    setLiked(!wasLiked);
    setLikes(wasLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1);

    try {
      await API.post(`/post/${post._id}/like`);
    } catch (e) {
      console.error(e);
      // rollback on error
      setLiked(wasLiked);
      setLikes(prevLikes);
      toast.error("Failed to like post");
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim() || editText === currentText) {
       setIsEditing(false);
       return;
    }
    
    // Optimistic UI update
    const previousText = currentText;
    setCurrentText(editText);
    setIsEditing(false);

    try {
      await API.put(`/post/${post._id}`, { text: editText });
      toast.success("Post updated!");
    } catch (e) {
      console.error(e);
      // rollback text
      setCurrentText(previousText);
      setEditText(previousText);
      toast.error("Failed to update post, using frontend mockup mode");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    // Hide optimistic
    setIsDeleted(true);
    setShowMenu(false);

    try {
      await API.delete(`/post/${post._id}`);
      toast.success("Post deleted successfully");
    } catch (e) {
      console.error(e);
      toast.error("Endpoint failed, but post deleted in UI");
    }
  };

  if (isDeleted) return null;

  return (
    <div className="card p-5 mb-5 group">
      
      {/* Header */}
      <div className="relative flex items-center gap-4 mb-4">
        <div 
           className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
           onClick={() => navigate(`/profile/${post.author?._id || post.author?.id}`)}
        >
           {post.author?.profilePhoto ? (
             <img
                src={post.author.profilePhoto}
                className="w-full h-full rounded-full object-cover"
                alt="Profile"
             />
           ) : (
             post.author?.name?.[0]?.toUpperCase() || "?"
           )}
        </div>
        <div className="flex-1">
          <div 
            onClick={() => navigate(`/profile/${post.author?._id || post.author?.id}`)}
            className="font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer inline-block"
          >
            {post.author?.name || "Unknown"}
          </div>
          <div className="text-xs text-slate-500 font-medium capitalize mt-0.5">{post.author?.role || "Member"}</div>
        </div>
        
        {/* Menu Toggle */}
        <div 
           className="text-slate-400 cursor-pointer p-2 hover:bg-slate-50 rounded-full transition-colors relative"
           onClick={() => setShowMenu(!showMenu)}
        >
          •••
        </div>

        {/* Dropdown Menu */}
        {showMenu && isOwner && (
           <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20 w-36">
              <div 
                 onClick={() => { setIsEditing(true); setShowMenu(false); }}
                 className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors font-medium"
              >
                 <FaEdit /> Edit Post
              </div>
              <div 
                 onClick={handleDelete}
                 className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors border-t border-slate-100 font-medium"
              >
                 <FaTrash /> Delete Post
              </div>
           </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 resize-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-sans"
              rows="3"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { setIsEditing(false); setEditText(currentText); }} 
                className="text-xs px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit} 
                className="text-xs px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-bold border border-blue-200"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {currentText}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media?.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
          <img src={post.media[0].url} className="w-full max-h-96 object-contain" alt="Post attachment" />
        </div>
      )}

      {/* Stats row */}
      <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors">
           <div className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><FaThumbsUp size={8}/></div>
           {likes} {likes === 1 ? 'Like' : 'Likes'}
        </div>
        <div 
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          {post.comments?.length || 0} Comments
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 text-sm text-slate-500 font-bold pt-1">
        <button 
          onClick={handleLike} 
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${liked ? 'text-blue-600 bg-blue-50' : 'hover:bg-slate-50 hover:text-blue-600'}`}
        >
          <FaThumbsUp className={liked ? 'scale-110 transition-transform' : ''} /> {liked ? 'Liked' : 'Like'}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all"
        >
          <FaRegCommentDots /> Comment
        </button>
      </div>

      {/* Comments Expansion */}
      {showComments && (
        <CommentSection postId={post._id} />
      )}
    </div>
  );
}