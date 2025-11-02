import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/axiosInstance'; // <-- Import API
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import ConfirmationModal from '../components/ConfirmationModal';
import ViewModal from '../components/ViewModal';
import { Edit, Trash2, Eye, CheckCircle } from 'lucide-react';

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date') || '';
  const today = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({
    taskDate: selectedDate || '',
    estimatedDays: '',
    estimatedMonths: '',
    estimatedTime: '',
    category: '',
    description: '',
    isRoutine: false
  });
  const [loading, setLoading] = useState(false);
  const categories = ['Work', 'Personal', 'Health'];

  useEffect(() => {
    setForm(prev => ({ ...prev, taskDate: selectedDate || '' }));
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = selectedDate ? `/tasks?date=${selectedDate}` : '/tasks';
      const { data } = await api.get(url);
      setTasks(Array.isArray(data) ? data : []);
      toast.success(`Loaded ${data.length} task(s)`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await api.put(`/tasks/${editingId}`, form);
        toast.success(res.data?.message || 'Task updated');
        setShowEdit(false);
      } else {
        const res = await api.post('/tasks', form);
        toast.success(res.data?.message || 'Task added');
        setShowAdd(false);
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      taskDate: selectedDate || '',
      estimatedDays: '',
      estimatedMonths: '',
      estimatedTime: '',
      category: '',
      description: '',
      isRoutine: false
    });
    setEditingId(null);
  };

  const handleEdit = (task) => {
    setForm({
      taskDate: task.taskDate.split('T')[0],
      estimatedDays: task.estimatedDays || '',
      estimatedMonths: task.estimatedMonths || '',
      estimatedTime: task.estimatedTime || '',
      category: task.category,
      description: task.description,
      isRoutine: task.isRoutine
    });
    setEditingId(task._id);
    setShowEdit(true);
    setShowAdd(false);
  };

  const handleView = async (id) => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setViewingTask(data);
      setShowView(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load task');
    }
  };

  const handleTick = async (id) => {
    try {
      await api.patch(`/tasks/${id}/tick`);
      toast.success('Ticked for today!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to tick');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/tasks/${deletingId}`);
      toast.success('Task deleted');
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const isTickedToday = (task) => {
    if (!task.completedDates) return false;
    const todayStr = today;
    return task.completedDates.some(d => d.toISOString().split('T')[0] === todayStr);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Tasks {selectedDate && `– ${new Date(selectedDate).toLocaleDateString()}`}
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
        >
          Add Task
        </button>
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
              {editingId ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="date" value={form.taskDate} onChange={e => setForm({ ...form, taskDate: e.target.value })} className="w-full p-3 border rounded-lg" required />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Days" value={form.estimatedDays} onChange={e => setForm({ ...form, estimatedDays: e.target.value })} className="p-3 border rounded-lg" />
                <input type="number" placeholder="Months" value={form.estimatedMonths} onChange={e => setForm({ ...form, estimatedMonths: e.target.value })} className="p-3 border rounded-lg" />
                <input type="text" placeholder="Time (e.g. 2h)" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} className="p-3 border rounded-lg" />
              </div>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full p-3 border rounded-lg" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-3 border rounded-lg h-24" required />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isRoutine} onChange={e => setForm({ ...form, isRoutine: e.target.checked })} />
                <span className="text-sm">Daily Routine (show every day)</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => { setShowAdd(false); setShowEdit(false); resetForm(); }} className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && viewingTask && (
        <ViewModal
          isOpen={showView}
          onClose={() => setShowView(false)}
          title={viewingTask.description}
          content={`${viewingTask.category} • ${viewingTask.estimatedDays || 0}d ${viewingTask.estimatedMonths || 0}m ${viewingTask.estimatedTime || ''}`}
          date={viewingTask.taskDate}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Task?"
          message="This cannot be undone."
        />
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Est.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Today</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map(task => (
                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{task.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(task.taskDate).toLocaleDateString()}
                    {task.isRoutine && <span className="ml-1 text-xs text-green-600">Routine</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {task.estimatedDays}d {task.estimatedMonths}m {task.estimatedTime}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{task.category}</td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleTick(task._id)}
                      disabled={isTickedToday(task)}
                      className={`p-1 rounded-full ${isTickedToday(task) ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleView(task._id)} className="text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(task)} className="text-green-600 hover:text-green-800"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(task._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
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

export default Tasks;