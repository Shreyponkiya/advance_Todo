import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AuthGuard from "./routes/AuthGuard";

import Dashboard from "./pages/Dashboard";
import DailyLog from "./pages/DailyLog";
import Growth from "./pages/Growth";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Login from "./pages/Login";

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<AuthGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
