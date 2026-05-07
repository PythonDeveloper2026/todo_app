import React from 'react';
import { useTodo } from '../../context/TodoContext';
import { FiStar, FiCheck, FiCalendar } from 'react-icons/fi';
import './styles.css';

const TaskCard = ({ task, onClick }) => {
  const { toggleComplete, toggleImportant } = useTodo();

  const priorityColors = {
    1: 'var(--priority-low)',
    2: 'var(--priority-medium)',
    3: 'var(--priority-high)',
    4: 'var(--priority-urgent)'
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;

  return (
    <div className={`task-card ${task.is_completed ? 'completed' : ''}`} onClick={() => onClick && onClick(task)}>
      <div 
        className={`checkbox ${task.is_completed ? 'checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleComplete(task.id);
        }}
      >
        {task.is_completed && <FiCheck />}
      </div>
      
      <div className="task-content">
        <h4 className={task.is_completed ? 'strikethrough' : ''}>{task.title}</h4>
        
        <div className="task-meta">
          {task.due_date && (
            <span className={`meta-item ${isOverdue ? 'text-danger' : ''}`}>
              <FiCalendar /> {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          {task.steps_count > 0 && (
            <span className="meta-item">
              {task.completed_steps_count}/{task.steps_count} steps
            </span>
          )}
          {task.subtasks_count > 0 && (
            <span className="meta-item">{task.subtasks_count} subtasks</span>
          )}
          <span className="priority-dot" style={{ backgroundColor: priorityColors[task.priority] }}></span>
        </div>
      </div>

      <button 
        className={`star-btn ${task.is_important ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleImportant(task.id);
        }}
      >
        <FiStar fill={task.is_important ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
};

export default TaskCard;
