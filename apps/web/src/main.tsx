import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AgentPage from "./pages/AgentPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import ModelsPage from "./pages/ModelsPage";
import NewProjectPage from "./pages/NewProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import RagMemoryPage from "./pages/RagMemoryPage";
import SentimentPage from "./pages/SentimentPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";

import { ProjectBrainPage } from "./pages/ProjectBrainPage";
import { SystemIntelligencePage } from "./pages/SystemIntelligencePage";
import { ResearchCenterPage } from "./pages/ResearchCenterPage";
import { ActivityConsolePage } from "./pages/ActivityConsolePage";
import { AgentMapPage } from "./pages/AgentMapPage";
import { TaskBoardPage } from "./pages/TaskBoardPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/rag-memory" element={<RagMemoryPage />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/project-brain" element={<ProjectBrainPage />} />
          <Route path="/system-intelligence" element={<SystemIntelligencePage />} />
          <Route path="/research-center" element={<ResearchCenterPage />} />
          <Route path="/activity-console" element={<ActivityConsolePage />} />
          <Route path="/agent-map" element={<AgentMapPage />} />
          <Route path="/task-board" element={<TaskBoardPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

