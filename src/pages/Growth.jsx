import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Edit2, Trash2 } from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";

const Growth = () => {
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");

  const [growths, setGrowths] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lineByLine, setLineByLine] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: date || "",
    line: "",
    source: "",
  });

  const token = localStorage.getItem("token");

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    fetchGrowths();
  }, [date]);

  const fetchGrowths = async () => {
    setLoading(true);
    try {
      const url = date
        ? `${import.meta.env.VITE_BASE_API_URL}/api/growths?date=${date}`
        : `${import.meta.env.VITE_BASE_API_URL}/api/growths`;

      const { data } = await axios.get(url, getAuthConfig());

      if (Array.isArray(data)) {
        setGrowths(data);
      } else {
        toast.error("Invalid data format");
        setGrowths([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load growths");
      setGrowths([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.line.trim() || !form.source.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_API_URL}/api/growths/${editingId}`,
          form,
          getAuthConfig()
        );
        toast.success(res.data?.message || "Growth updated successfully");
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/api/growths`,
          form,
          getAuthConfig()
        );
        toast.success(res.data?.message || "Growth added successfully");
      }

      setForm({ date: date || "", line: "", source: "" });
      setShowAdd(false);
      setShowEdit(false);
      setEditingId(null);

      fetchGrowths();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save growth");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (g) => {
    setForm({
      date: g.date ? g.date.split("T")[0] : "",
      line: g.line || "",
      source: g.source || "",
    });
    setEditingId(g._id);
    setShowEdit(true);
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_API_URL}/api/growths/${deletingId}`,
        getAuthConfig()
      );
      toast.success(res.data?.message || "Growth deleted successfully");
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchGrowths();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="pt-20 p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Growth {date && `– ${new Date(date).toLocaleDateString()}`}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setForm({ date: date || "", line: "", source: "" });
              setShowAdd(true);
              setShowEdit(false);
            }}
            className="flex-1 sm:flex-initial bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add Growth
          </button>
          <button
            onClick={() => setLineByLine(!lineByLine)}
            className="flex-1 sm:flex-initial bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {lineByLine ? "Table View" : "Line by Line"}
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? "Edit Growth" : "Add Growth"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="text"
                value={form.line}
                onChange={(e) => setForm({ ...form, line: e.target.value })}
                placeholder="Growth Line"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Source"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setShowEdit(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Growth?"
          message="This action cannot be undone."
        />
      )}

      {/* Table or Line-by-Line View */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          Loading growths...
        </p>
      ) : growths.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No growth entries found.
        </p>
      ) : lineByLine ? (
        <div className="space-y-3">
          {growths.map((g) => (
            <div
              key={g._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-lg transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {g.line}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {g.source} •{" "}
                  {g.date ? new Date(g.date).toLocaleDateString() : "No date"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(g)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(g._id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {growths.map((g) => (
                <tr
                  key={g._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {g.line}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {g.source}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {g.date ? new Date(g.date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm flex gap-3">
                    <button
                      onClick={() => handleEdit(g)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                    >
                      <Trash2 size={16} />
                    </button>
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

export default Growth;
