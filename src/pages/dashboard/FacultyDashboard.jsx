import Layout from "../../components/layout/Layout";
import CreatePost from "../../components/post/CreatePost";
import Feed from "../../features/feed/Feed";

export default function FacultyDashboard() {
  return (
    <Layout>
      <CreatePost />
      <Feed />
    </Layout>
  );
}