import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTodo } from '../../context/TodoContext';
import TaskCard from '../../components/TaskCard';
import { FiPlus } from 'react-icons/fi';

const ListDetailPage = () => {
  const { id } = useParams();
  const { lists, tasks, fetchTasks, createTask, loading } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const currentList = lists.find(l => l.id === parseInt(id));

  useEffect(() => {
    fetchTasks({ list_id: id });
  }, [fetchTasks, id]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({ title: newTaskTitle, todo_list: id });
    setNewTaskTitle('');
  };

  if (!currentList) return <div>Loading list...</div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="list-color" style={{ backgroundColor: currentList.color, width: 20, height: 20, borderRadius: '50%' }}></span>
        <h2>{currentList.title}</h2>
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
            placeholder={`Add a task to ${currentList.title}...`}
            className="input-field"
          />
        </div>
      </form>
    </div>
  );
};

export default ListDetailPage;
