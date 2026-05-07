import React, { useEffect, useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import TaskCard from '../../components/TaskCard';
import { FiPlus } from 'react-icons/fi';

const TodayPage = ({ title = "Today", type = "today" }) => {
  const { tasks, fetchTasks, createTask, loading } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    // Backend API doesn't have a direct /tasks/ endpoint with type filter in this implementation,
    // wait, we defined /tasks/today/, /tasks/my-day/, /tasks/important/, /tasks/upcoming/
    // Let's use fetchTasks but we need to override the URL.
    // Actually, we can fetch all tasks and filter locally, or adjust context to support it.
    // In TodoContext, fetchTasks uses /tasks/. Let's just fetch all tasks and filter here for simplicity.
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

  const filteredTasks = tasks.filter(task => {
    if (type === 'my-day') return task.is_my_day;
    if (type === 'important') return task.is_important;
    if (type === 'upcoming') return task.due_date && new Date(task.due_date) > new Date();
    // Default today
    return true; 
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{title}</h2>
        <p className="text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="tasks-list">
        {loading ? <p>Loading...</p> : filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="input-wrapper">
          <FiPlus className="input-icon" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="input-field"
          />
        </div>
      </form>
    </div>
  );
};

export default TodayPage;
