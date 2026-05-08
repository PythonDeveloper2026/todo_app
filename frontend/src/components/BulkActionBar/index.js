import React, { useState } from 'react';
import { FiCheck, FiTrash2, FiMove, FiX } from 'react-icons/fi';
import { useTodo } from '../../context/TodoContext';
import './styles.css';

const BulkActionBar = ({ selectedTasks, onClear }) => {
  const { lists, toggleComplete, deleteTask } = useTodo();
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const handleBulkComplete = async () => {
    for (const taskId of selectedTasks) {
      await toggleComplete(taskId);
    }
    onClear();
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTasks.length} tasks?`)) return;
    for (const taskId of selectedTasks) {
      await deleteTask(taskId);
    }
    onClear();
  };

  const handleMoveToList = async (listId) => {
    for (const taskId of selectedTasks) {
      await toggleComplete(taskId, { todo_list: listId });
    }
    setShowMoveMenu(false);
    onClear();
  };

  return (
    <div className="bulk-action-bar">
      <div className="selected-count">
        {selectedTasks.length} selected
      </div>

      <div className="bulk-actions">
        <button className="bulk-btn" onClick={handleBulkComplete}>
          <FiCheck /> Complete
        </button>

        <div className="move-dropdown">
          <button className="bulk-btn" onClick={() => setShowMoveMenu(!showMoveMenu)}>
            <FiMove /> Move to
          </button>
          {showMoveMenu && (
            <div className="move-menu">
              {lists.map(list => (
                <button
                  key={list.id}
                  className="move-option"
                  onClick={() => handleMoveToList(list.id)}
                >
                  <span className="list-color" style={{ backgroundColor: list.color }}></span>
                  {list.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="bulk-btn danger" onClick={handleBulkDelete}>
          <FiTrash2 /> Delete
        </button>

        <button className="bulk-btn-text" onClick={onClear}>
          <FiX /> Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;