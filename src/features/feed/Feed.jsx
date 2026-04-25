import { useEffect, useState } from "react";
import API from "../../api";
import PostCard from "../../components/post/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/post/feed");
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Listen for feed-refresh event dispatched by CreatePost after a new post
    const handleRefresh = () => fetchPosts();
    window.addEventListener("feed-refresh", handleRefresh);

    return () => window.removeEventListener("feed-refresh", handleRefresh);
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}