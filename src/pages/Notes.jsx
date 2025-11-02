import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import ViewModal from '../components/ViewModal';
import { Edit, Trash2, Eye } from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch token safely
  const token = localStorage.getItem('token');

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // ✅ Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // ✅ Fetch All Notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/notes`, getAuthConfig());
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        setNotes([]);
        toast.error('Invalid data received');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add or Edit Note
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Update note
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_API_URL}/api/notes/${editingId}`,
          form,
          getAuthConfig()
        );
        toast.success(res.data?.message || 'Note updated successfully');
        setShowEdit(false);
      } else {
        // Add new note
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/api/notes`,
          form,
          getAuthConfig()
        );
        toast.success(res.data?.message || 'Note added successfully');
        setShowAdd(false);
      }

      // ✅ Always refresh to ensure accurate data
      await fetchNotes();

      // Reset form
      setForm({ title: '', content: '' });
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit Note Setup
  const handleEdit = (note) => {
    setForm({ title: note.title || '', content: note.content || '' });
    setEditingId(note._id);
    setShowEdit(true);
    setShowAdd(false);
  };

  // ✅ View Note
  const handleView = async (id) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_API_URL}/api/notes/${id}`,
        getAuthConfig()
      );
      setViewingNote(data);
      setShowView(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load note');
    }
  };

  // ✅ Delete Confirmation
  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  // ✅ Delete Note
  const confirmDelete = async () => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_API_URL}/api/notes/${deletingId}`,
        getAuthConfig()
      );
      toast.success(res.data?.message || 'Note deleted');

      // ✅ Refetch to ensure state is accurate
      await fetchNotes();

      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="pt-20 p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Notes
        </h1>
        <button
          onClick={() => {
            setShowAdd(true);
            setShowEdit(false);
            setEditingId(null);
            setForm({ title: '', content: '' });
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
        >
          Add Note
        </button>
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              {editingId ? 'Edit Note' : 'Add Note'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Content"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-40 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 font-medium"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setShowEdit(false);
                    setEditingId(null);
                    setForm({ title: '', content: '' });
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && viewingNote && (
        <ViewModal
          isOpen={showView}
          onClose={() => setShowView(false)}
          title={viewingNote.title}
          content={viewingNote.content}
          createdAt={viewingNote.createdAt}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Note?"
          message="This action cannot be undone."
        />
      )}

      {/* Notes Table */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          Loading notes...
        </p>
      ) : notes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No notes found.
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
                  Content
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {notes.map((note) => (
                <tr
                  key={note._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {note.title}
                  </td>
                  <td
                    className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate"
                    title={note.content}
                  >
                    {note.content}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleView(note._id)}
                        title="View"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        title="Edit"
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
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

export default Notes;
