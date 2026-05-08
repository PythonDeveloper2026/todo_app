import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodo } from '../../context/TodoContext';
import TaskCard from '../../components/TaskCard';
import TaskDetailModal from '../../components/TaskDetailModal';
import BulkActionBar from '../../components/BulkActionBar';
import { FiPlus, FiChevronRight } from 'react-icons/fi';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import './styles.css';

const DashboardPage = () => {
  const { tasks, fetchTasks, createTask, loading, pagination } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useKeyboardShortcuts({
    'n': () => {
      document.querySelector('.input-field')?.focus();
    },
    '/': () => navigate('/app/search'),
    's': () => navigate('/app/stats'),
    'Escape': () => {
      setSelectMode(false);
      setSelectedTasks([]);
    },
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({ title: newTaskTitle });
    setNewTaskTitle('');
  };

  const handleOpenNewTask = () => {
    setSelectedTask({ title: newTaskTitle, description: '', priority: 1 });
    setIsNewTask(true);
  };

  const handleSelectTask = (taskId, selected) => {
    if (selected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleBulkClear = () => {
    setSelectedTasks([]);
    setSelectMode(false);
  };

  const handleLoadMore = () => {
    if (pagination.next) {
      fetchTasks({ page: pagination.next.split('=')[1] });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>All Tasks</h2>
        <button 
          className={`select-mode-btn ${selectMode ? 'active' : ''}`}
          onClick={() => setSelectMode(!selectMode)}
        >
          {selectMode ? 'Cancel' : 'Select'}
        </button>
      </div>

      <div className="tasks-list">
        {loading ? <p>Loading...</p> : tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={setSelectedTask}
            selectable={selectMode}
            selected={selectedTasks.includes(task.id)}
            onSelect={handleSelectTask}
          />
        ))}
      </div>

      {pagination.next && (
        <div className="pagination">
          <button onClick={handleLoadMore} disabled={loading}>
            <FiChevronRight /> Load More
          </button>
        </div>
      )}

      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task... (Press N)"
            className="input-field"
          />
          <button 
            type="button" 
            className="create-btn"
            onClick={handleOpenNewTask}
            title="Create with full details"
          >
            <FiPlus />
          </button>
        </div>
      </form>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => {
            setSelectedTask(null);
            setIsNewTask(false);
          }} 
          isNew={isNewTask}
          onSave={(task) => {
            setSelectedTask(task);
            setIsNewTask(false);
          }}
        />
      )}

      {selectedTasks.length > 0 && (
        <BulkActionBar selectedTasks={selectedTasks} onClear={handleBulkClear} />
      )}
    </div>
  );
};

export default DashboardPage;