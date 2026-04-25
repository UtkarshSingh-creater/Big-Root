import Layout from "../../components/layout/Layout";
import CreatePost from "../../components/post/CreatePost";
import Feed from "../../features/feed/Feed";

export default function AlumniDashboard() {
  return (
    <Layout>
      <CreatePost />
      <Feed />
    </Layout>
  );
}
