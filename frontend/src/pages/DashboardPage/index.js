import React, { useEffect, useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import TaskCard from '../../components/TaskCard';
import { FiPlus } from 'react-icons/fi';

const DashboardPage = () => {
  const { tasks, fetchTasks, createTask, loading } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({ title: newTaskTitle });
    setNewTaskTitle('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>All Tasks</h2>
      </div>

      <div className="tasks-list">
        {loading ? <p>Loading...</p> : tasks.map(task => (
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

export default DashboardPage;
