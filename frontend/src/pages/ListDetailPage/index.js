import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTodo } from '../../context/TodoContext';
import TaskCard from '../../components/TaskCard';
import TaskDetailModal from '../../components/TaskDetailModal';
import { FiPlus } from 'react-icons/fi';
import './styles.css';

const ListDetailPage = () => {
  const { id } = useParams();
  const { lists, tasks, fetchTasks, createTask, loading } = useTodo();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);

  const currentList = lists.find(l => l.id === parseInt(id));

  useEffect(() => {
    fetchTasks({ todo_list: id });
  }, [fetchTasks, id]);

  const listTasks = tasks.filter(t => t.todo_list === parseInt(id));

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({ title: newTaskTitle, todo_list: id });
    setNewTaskTitle('');
  };

  const handleOpenNewTask = () => {
    setSelectedTask({ title: newTaskTitle, description: '', priority: 1, todo_list: id });
    setIsNewTask(true);
  };

  if (!currentList) return <div>Loading list...</div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="list-color" style={{ backgroundColor: currentList.color, width: 20, height: 20, borderRadius: '50%' }}></span>
        <h2>{currentList.title}</h2>
      </div>

      <div className="tasks-list">
        {loading ? <p>Loading...</p> : listTasks.map(task => (
          <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
        ))}
      </div>

      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={`Add a task to ${currentList.title}...`}
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

export default ListDetailPage;