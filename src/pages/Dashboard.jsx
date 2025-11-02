import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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
          },
        }
      : null;
  };

  // ✅ Fetch only routine tasks
  const fetchTasks = async () => {
    const config = getAuthConfig();
    if (!config) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tasks`, config);
      const data = await res.json();
      const routine = (Array.isArray(data) ? data : []).filter(
        (t) => t.isRoutine
      );
      setTasks(routine);
    } catch (e) {
      console.error("Error loading tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ Date helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const windowDays = 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + offset - 3);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + offset + 3);

  const getDateRange = (start, end) => {
    const list = [];
    let current = new Date(start);
    while (current <= end) {
      list.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return list;
  };

  const dateRange = getDateRange(startDate, endDate);

  const isCompleted = (task, dateStr) =>
    task.completedDates?.some((d) => d.split("T")[0] === dateStr);

  const toggleTask = async () => {
    navigate(`/tasks`);
  };

  const handlePrev = () => setOffset(offset - windowDays);
  const handleNext = () => setOffset(offset + windowDays);
  const handleToday = () => setOffset(0);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br pt-20 from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex justify-center items-center gap-2">
            <Zap className="text-blue-600" />
            Daily Routine Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Stay consistent — one tick at a time
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow p-3 mb-4">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          {/* Dates Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="p-3 font-semibold text-gray-700 dark:text-gray-300">
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
                  className={`p-3 text-center ${
                    isToday
                      ? "bg-blue-100 dark:bg-blue-900/40 font-semibold"
                      : ""
                  }`}
                >
                  <div
                    className={`text-sm ${
                      isToday ? "text-black font-bold" : "text-gray-500"
                    }`}
                  >
                    {week}
                  </div>
                  <div
                    className={`text-lg ${
                      isToday
                        ? "text-black font-bold"
                        : "text-gray-800 dark:text-gray-100"
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
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No routine tasks found.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className="grid grid-cols-8 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
              >
                <div
                  onClick={() => navigate(`/task/${task._id}`)}
                  className="p-3 flex items-center font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {task.description}
                </div>
                {dateRange.map((dateStr) => {
                  const done = isCompleted(task, dateStr);
                  const isDisabled = toggling === `${task._id}-${dateStr}`;
                  return (
                    <div
                      key={dateStr}
                      className="p-3 flex justify-center items-center"
                    >
                      <button
                        onClick={() => toggleTask(task._id, dateStr)}
                        disabled={isDisabled}
                        className={`transition-transform transform hover:scale-110 ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="text-green-600 w-7 h-7" />
                        ) : (
                          <Circle className="text-gray-300 dark:text-gray-600 w-7 h-7" />
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
  );
};

export default Dashboard;
