import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyLog from './pages/DailyLog';
import Growth from './pages/Growth';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
