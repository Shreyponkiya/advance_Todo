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
      <div className="flex flex-col justify-center items-center h-screen text-gray-600 dark:text-gray-300">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p className="text-lg font-semibold">Loading your tasks...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="font-semibold text-lg">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br pt-20 from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex justify-center items-center gap-2">
            <Zap className="text-blue-600 animate-pulse" />
            Daily Routine Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Stay consistent — one tick at a time
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow p-2 sm:p-3 mb-3 sm:mb-4">
          <button
            onClick={handlePrev}
            className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Scrollable Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-x-auto">
          <div className="min-w-[700px] sm:min-w-full">
            {/* Dates Header */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-xs sm:text-sm">
              <div className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
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
                    className={`p-2 sm:p-3 text-center ${
                      isToday ? "bg-blue-100 dark:bg-blue-900/40 font-semibold" : ""
                    }`}
                  >
                    <div
                      className={`text-[10px] sm:text-xs ${
                        isToday ? "text-black font-bold" : "text-gray-500"
                      }`}
                    >
                      {week}
                    </div>
                    <div
                      className={`text-sm sm:text-lg ${
                        isToday ? "text-black font-bold" : "text-gray-800 dark:text-gray-100"
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
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No routine tasks found.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="grid grid-cols-8 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition text-xs sm:text-sm"
                >
                  <div
                    onClick={() => navigate(`/task/${task._id}`)}
                    className="p-2 sm:p-3 flex items-center font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {task.description}
                  </div>
                  {dateRange.map((dateStr) => {
                    const done = isCompleted(task, dateStr);
                    const isDisabled = toggling === `${task._id}-${dateStr}`;
                    return (
                      <div key={dateStr} className="p-2 sm:p-3 flex justify-center items-center">
                        <button
                          onClick={() => toggleTask(task._id, dateStr)}
                          disabled={isDisabled}
                          className={`transition-transform hover:scale-105 ${
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {done ? (
                            <CheckCircle className="text-green-600 w-4 h-4 sm:w-6 sm:h-6" />
                          ) : (
                            <Circle className="text-gray-300 dark:text-gray-600 w-4 h-4 sm:w-6 sm:h-6" />
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
