// Updated Tasks.jsx - Fixed category fetch to include _id, table view, checkbox for completion, mobile responsive
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, X, Check, Calendar, Clock, ChevronLeft, Edit2, Trash2, PlusCircle } from 'lucide-react';

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    taskDate: new Date().toISOString().split('T')[0],
    estimatedDays: 0,
    estimatedMonths: 0,
    estimatedTime: '',
    category: '',
    isRoutine: false
  });
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [categories, setCategories] = useState([]); // Now array of { _id, name }
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);

  const API_BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/api`;

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch categories on mount - now returns full objects { _id, name }
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/categories`, getAuthConfig());
        setCategories(res.data || []); // Ensure array
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data[0].name }));
        } else {
          // Fallback if no categories
          toast.info('No categories found. Add one to get started.');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        toast.error('Failed to load categories. Using fallback.');
        // Fallback hardcoded if API fails
        const fallback = ['Work', 'Personal', 'Health'];
        setCategories(fallback.map(name => ({ _id: `fallback-${name}`, name })));
        setFormData(prev => ({ ...prev, category: fallback[0] }));
      }
    };
    fetchCategories();
  }, []);

  // Fetch tasks for selected date
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks?date=${selectedDate}`, getAuthConfig());
        setTasks(res.data || []);
      } catch (err) {
        toast.error('Failed to load tasks');
        setTasks([]);
        console.error(err);
      }
    };
    fetchTasks();
  }, [selectedDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.taskDate || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingTask) {
        await axios.put(`${API_BASE_URL}/tasks/${editingTask._id}`, formData, getAuthConfig());
        toast.success('Task updated successfully!');
        setEditingTask(null);
      } else {
        await axios.post(`${API_BASE_URL}/tasks`, formData, getAuthConfig());
        toast.success('Task added successfully!');
      }
      setShowAddModal(false);
      resetTaskForm();
      const updatedRes = await axios.get(`${API_BASE_URL}/tasks?date=${selectedDate}`, getAuthConfig());
      setTasks(updatedRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setCategoryLoading(true);
    try {
      if (editingCategory) {
        await axios.put(`${API_BASE_URL}/tasks/categories/${editingCategory._id}`, { name: categoryFormData.name }, getAuthConfig());
        toast.success('Category updated successfully!');
        setEditingCategory(null);
      } else {
        await axios.post(`${API_BASE_URL}/tasks/categories`, { name: categoryFormData.name }, getAuthConfig());
        toast.success('Category added successfully!');
      }
      setShowAddCategoryModal(false);
      setShowEditCategoryModal(false);
      resetCategoryForm();
      const res = await axios.get(`${API_BASE_URL}/tasks/categories`, getAuthConfig());
      setCategories(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const resetTaskForm = () => {
    setFormData({
      description: '',
      taskDate: new Date().toISOString().split('T')[0],
      estimatedDays: 0,
      estimatedMonths: 0,
      estimatedTime: '',
      category: categories[0]?.name || '',
      isRoutine: false
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '' });
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      description: task.description,
      taskDate: new Date(task.taskDate).toISOString().split('T')[0],
      estimatedDays: task.estimatedDays || 0,
      estimatedMonths: task.estimatedMonths || 0,
      estimatedTime: task.estimatedTime || '',
      category: task.category,
      isRoutine: task.isRoutine || false
    });
    setShowAddModal(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name });
    setShowEditCategoryModal(true);
  };

  const handleTickTask = async (taskId, currentCompleted) => {
    if (currentCompleted) return; // Already ticked, no action
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/tick`, {}, getAuthConfig());
      toast.success('Task marked as complete for today!');
      const updatedRes = await axios.get(`${API_BASE_URL}/tasks?date=${selectedDate}`, getAuthConfig());
      setTasks(updatedRes.data || []);
    } catch (err) {
      toast.error('Failed to mark task as complete');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, getAuthConfig());
      toast.success('Task deleted successfully!');
      const updatedRes = await axios.get(`${API_BASE_URL}/tasks?date=${selectedDate}`, getAuthConfig());
      setTasks(updatedRes.data || []);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? Tasks using it will remain but may need reassignment.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/categories/${categoryId}`, getAuthConfig());
      toast.success('Category deleted successfully!');
      const res = await axios.get(`${API_BASE_URL}/tasks/categories`, getAuthConfig());
      setCategories(res.data || []);
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="pt-20 p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Tasks for {formatDate(selectedDate)}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-w-2xl mx-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks for today. Add one to get started!</p>
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estimated Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Routine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Complete Today</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {tasks.map((task) => {
                const isCompleted = task.completedDates?.some(d => 
                  new Date(d).toISOString().split('T')[0] === selectedDate
                );
                return (
                  <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.estimatedTime || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.isRoutine && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Yes</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => handleTickTask(task._id, isCompleted)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        disabled={isCompleted} // Only tick if not already
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditTask(task)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Task Modal - Same as before, but ensure category select uses .name */}
      {(showAddModal || !!editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date *</label>
                <input
                  type="date"
                  name="taskDate"
                  value={formData.taskDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Days</label>
                  <input
                    type="number"
                    name="estimatedDays"
                    value={formData.estimatedDays}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Months</label>
                  <input
                    type="number"
                    name="estimatedMonths"
                    value={formData.estimatedMonths}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Time (e.g., 2h 30m)</label>
                <input
                  type="text"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  placeholder="e.g., 1h 15m"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isRoutine"
                  checked={formData.isRoutine}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">This is a routine task (repeats daily)</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {(showAddCategoryModal || showEditCategoryModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button 
                onClick={() => { 
                  setShowAddCategoryModal(false); 
                  setShowEditCategoryModal(false); 
                  setEditingCategory(null); 
                }} 
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { 
                    setShowAddCategoryModal(false); 
                    setShowEditCategoryModal(false); 
                    setEditingCategory(null); 
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  <span>{categoryLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Add')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="mt-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Categories</h2>
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories yet. Add one above!</p>
          ) : (
            categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>  
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;