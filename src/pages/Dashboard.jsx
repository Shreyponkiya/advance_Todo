import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [toggling, setToggling] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/api`;

  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const getAuthConfig = () => {
    const token = getToken();
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }          
        }
      : null;
  };

  const fetchTasks = async () => {
    const config = getAuthConfig();
    if (!config) return;

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/tasks`, config);
      const data = res.data;
      const routine = (Array.isArray(data) ? data : []).filter(
        (t) => t.isRoutine
      );
      setTasks(routine);
    } catch (e) {
      console.error("Error loading tasks:", e);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ Local date-safe logic
    // ✅ Local time-safe date calculation
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayStr = localToday.toLocaleDateString("en-CA");

  const windowDays = 7;
  const startDate = new Date(localToday);
  startDate.setDate(localToday.getDate() + offset - 3);
  const endDate = new Date(localToday);
  endDate.setDate(localToday.getDate() + offset + 3);

  const getDateRange = (start, end) => {
    const list = [];
    let current = new Date(start);
    while (current <= end) {
      list.push(current.toLocaleDateString("en-CA"));
      current.setDate(current.getDate() + 1);
    }
    return list;
  };

  const dateRange = getDateRange(startDate, endDate);


  const isCompleted = (task, dateStr) =>
    task.completedDates?.some(
      (d) => new Date(d).toLocaleDateString("en-CA") === dateStr
    );

  const toggleTask = (taskId, dateStr) => {
    navigate(`/tasks`);
  };

  const handlePrev = () => setOffset(offset - windowDays);
  const handleNext = () => setOffset(offset + windowDays);
  const handleToday = () => setOffset(0);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        <Loader2 className="animate-spin w-16 h-16 text-indigo-600 mb-4" />
        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">Loading your tasks...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        <AlertCircle className="w-14 h-14 mb-4 text-red-500" />
        <p className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-2">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br pt-20 from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex justify-center items-center gap-3">
            <Zap className="text-indigo-600 animate-pulse w-10 h-10" />
            Daily Routine Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg font-medium">
            Build consistency, one day at a time ✨
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4 mb-6">
          <button
            onClick={handlePrev}
            className="p-2 sm:p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={handleToday}
            className="px-5 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 sm:p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Scrollable Grid */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="min-w-[700px] sm:min-w-full">
            {/* Dates Header */}
            <div className="grid grid-cols-8 border-b-2 border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-indigo-900/50 text-xs sm:text-sm">
              <div className="p-3 sm:p-4 font-bold text-slate-800 dark:text-slate-200">
                Task
              </div>
              {dateRange.map((dateStr) => {
                const date = new Date(dateStr);
                const day = date.getDate();
                const week = date.toLocaleString("default", { weekday: "short" });
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    className={`p-3 sm:p-4 text-center transition-all ${
                      isToday 
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg" 
                        : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    }`}
                  >
                    <div
                      className={`text-[10px] sm:text-xs uppercase tracking-wider ${
                        isToday ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {week}
                    </div>
                    <div
                      className={`text-base sm:text-xl font-bold mt-1 ${
                        isToday ? "text-white" : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tasks */}
            {tasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-slate-400 dark:text-slate-500 text-lg mb-2">No routine tasks yet</div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Create your first task to get started!</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task._id}
                  className={`grid grid-cols-8 border-t border-slate-200 dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-200 text-xs sm:text-sm ${
                    index % 2 === 0 ? 'bg-white/50 dark:bg-slate-800/50' : 'bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div
                    onClick={() => navigate(`/task/${task._id}`)}
                    className="p-3 sm:p-4 flex items-center font-semibold text-slate-800 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {task.description}
                  </div>
                  {dateRange.map((dateStr) => {
                    const done = isCompleted(task, dateStr);
                    const isDisabled = toggling === `${task._id}-${dateStr}`;
                    return (
                      <div key={dateStr} className="p-3 sm:p-4 flex justify-center items-center">
                        <button
                          onClick={() => toggleTask(task._id, dateStr)}
                          disabled={isDisabled}
                          className={`transition-all duration-200 hover:scale-110 ${
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {done ? (
                            <CheckCircle className="text-emerald-500 w-5 h-5 sm:w-7 sm:h-7 drop-shadow-lg" />
                          ) : (
                            <Circle className="text-slate-300 dark:text-slate-600 w-5 h-5 sm:w-7 sm:h-7 hover:text-indigo-400 dark:hover:text-indigo-500" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
