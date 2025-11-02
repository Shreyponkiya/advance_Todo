import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import ViewModal from "../components/ViewModal";
import { Edit, Trash2, Eye } from "lucide-react";

// ✅ Reusable Add/Edit Modal Component
const AddEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  loading,
  isEdit,
  selectedDate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
          {isEdit ? "Edit Log" : "Add Log"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />

          <textarea
            value={form.log}
            onChange={(e) => setForm({ ...form, log: e.target.value })}
            placeholder="Log entry"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32 resize-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="hours"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Hours
              </label>
              <input
                id="hours"
                type="number"
                value={form.timeSpent.hours}
                onChange={(e) =>
                  setForm({
                    ...form,
                    timeSpent: { ...form.timeSpent, hours: e.target.value },
                  })
                }
                placeholder="Hours"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="minutes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Minutes
              </label>
              <input
                id="minutes"
                type="number"
                value={form.timeSpent.minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    timeSpent: { ...form.timeSpent, minutes: e.target.value },
                  })
                }
                placeholder="Minutes"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                min="0"
                max="59"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setForm({
                  date: selectedDate || "",
                  title: "",
                  log: "",
                  timeSpent: { hours: "", minutes: "" },
                });
              }}
              className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DailyLog = () => {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get("date");
  const [logs, setLogs] = useState([]);
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showView, setShowView] = useState(false);

  const [form, setForm] = useState({
    date: selectedDate || "",
    title: "",
    log: "",
    timeSpent: { hours: "", minutes: "" },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: selectedDate || "" }));
    fetchLogs();
  }, [selectedDate]);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = selectedDate
        ? `${import.meta.env.VITE_BASE_API_URL}/api/daily-logs?date=${selectedDate}`
        : `${import.meta.env.VITE_BASE_API_URL}/api/daily-logs`;
      const { data } = await axios.get(url, getAuthConfig());
      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = {
        ...form,
        timeSpent: {
          hours: Number(form.timeSpent.hours) || 0,
          minutes: Number(form.timeSpent.minutes) || 0,
        },
      };

      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_BASE_API_URL}/api/daily-logs/${editingId}`,
          formData,
          getAuthConfig()
        );
        toast.success("Log updated");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/api/daily-logs`,
          formData,
          getAuthConfig()
        );
        toast.success("Log added");
      }

      setShowAdd(false);
      setShowEdit(false);
      setEditingId(null);
      setForm({
        date: selectedDate || "",
        title: "",
        log: "",
        timeSpent: { hours: "", minutes: "" },
      });
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log) => {
    setForm({
      date: log.date ? log.date.split("T")[0] : "",
      title: log.title || "",
      log: log.log || "",
      timeSpent: {
        hours: log.timeSpent?.hours || 0,
        minutes: log.timeSpent?.minutes || 0,
      },
    });
    setEditingId(log._id);
    setShowEdit(true);
    setShowAdd(false);
  };

  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_API_URL}/api/daily-logs/${id}`,
        getAuthConfig()
      );
      setViewingLog(data);
      setShowView(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load log");
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_API_URL}/api/daily-logs/${deletingId}`,
        getAuthConfig()
      );
      toast.success("Log deleted");
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="pt-20 p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Daily Logs {selectedDate && `– ${new Date(selectedDate).toLocaleDateString()}`}
        </h1>
        <button
          onClick={() => {
            setShowAdd(true);
            setShowEdit(false);
            setEditingId(null);
            setForm({
              date: selectedDate || "",
              title: "",
              log: "",
              timeSpent: { hours: "", minutes: "" },
            });
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
        >
          Add Log
        </button>
      </div>

      {/* ✅ Add / Edit Modals */}
      <AddEditModal
        isOpen={showAdd || showEdit}
        onClose={() => {
          setShowAdd(false);
          setShowEdit(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        loading={loading}
        isEdit={showEdit}
        selectedDate={selectedDate}
      />

      {/* ✅ View Modal */}
      {showView && viewingLog && (
        <ViewModal
          isOpen={showView}
          onClose={() => setShowView(false)}
          title={viewingLog.title}
          content={viewingLog.log}
          date={viewingLog.date}
          timeSpent={`${viewingLog.timeSpent?.hours || 0}h ${viewingLog.timeSpent?.minutes || 0}m`}
        />
      )}

      {/* ✅ Delete Confirmation */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Log?"
          message="This action cannot be undone."
        />
      )}

      {/* ✅ Table */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          Loading logs...
        </p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No logs found for this date.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Log
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {log.title}
                  </td>
                  <td
                    className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate"
                    title={log.log}
                  >
                    {log.log}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.date
                      ? new Date(log.date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.timeSpent
                      ? `${log.timeSpent.hours || 0}h ${log.timeSpent.minutes || 0}m`
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleView(log._id)}
                        title="View"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(log)}
                        title="Edit"
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log._id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DailyLog;
