import { useEffect, useState } from "react";
import API from "../../api";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/post/${postId}/comments`);
      setComments(res.data.comments || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const addComment = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await API.post(`/post/${postId}/comment`, { text });
      setText("");
      fetchComments();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      
      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="flex gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold flex-shrink-0">
                {c.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 border border-white/5 flex-1 shadow-inner">
                <span className="font-semibold text-white/90 mr-2 hover:text-emerald-400 cursor-pointer transition-colors hover:underline">
                  {c.user?.name || "Unknown User"}
                </span>
                <span className="text-slate-300 block mt-1 tracking-wide">{c.text}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-xs text-slate-500 py-2">
            No comments yet. Be the first to start the conversation!
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
         <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            Me
         </div>
        <input
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addComment()}
          className="input-field flex-1 py-2 text-sm !rounded-full"
        />
        <button 
           onClick={addComment} 
           disabled={loading || !text.trim()} 
           className="btn-primary py-2 px-4 rounded-full text-sm disabled:opacity-50"
        >
          {loading ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}