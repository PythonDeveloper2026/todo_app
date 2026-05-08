import React, { useEffect, useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import TaskCard from '../../components/TaskCard';
import TaskDetailModal from '../../components/TaskDetailModal';
import { FiPlus } from 'react-icons/fi';
import './styles.css';

const TodayPage = ({ title = "Today", type = "today" }) => {
  const { tasks, fetchTasks, createTask, loading } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const taskData = {
      title: newTaskTitle,
      is_my_day: type === 'my-day',
      is_important: type === 'important',
    };
    
    createTask(taskData);
    setNewTaskTitle('');
  };

  const handleOpenNewTask = () => {
    setSelectedTask({ 
      title: newTaskTitle, 
      description: '', 
      priority: 1,
      is_my_day: type === 'my-day',
      is_important: type === 'important',
    });
    setIsNewTask(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (type === 'my-day') return task.is_my_day;
    if (type === 'important') return task.is_important;
    if (type === 'upcoming') return task.due_date && new Date(task.due_date) > new Date();
    if (type === 'today') return task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
    return true; 
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{title}</h2>
        <p className="text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="tasks-list">
        {loading ? <p>Loading...</p> : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks here yet.</p>
            <p className="text-secondary">Add a task below to get started.</p>
          </div>
        ) : filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
        ))}
      </div>

      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={`Add a task to ${title.toLowerCase()}...`}
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
    </div>
  );
};

export default TodayPage;