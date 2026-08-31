import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Claims from "./pages/Claims";
import Demographics from "./pages/Demographics";
import Members from "./pages/Members";
import Opportunities from "./pages/Opportunities";
import Outreach from "./pages/Outreach";
import Overview from "./pages/Overview";
import Production from "./pages/Production";
import Project from "./pages/Project";
import SelfServe from "./pages/SelfServe";
import Team from "./pages/Team";

function Home() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/project", search }} replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project" element={<Project />} />
        <Route path="/self-serve" element={<SelfServe />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/production" element={<Production />} />
        <Route path="/members" element={<Members />} />
        <Route path="/demographics" element={<Demographics />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </Layout>
  );
}
