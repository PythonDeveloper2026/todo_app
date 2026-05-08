import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import { FiX, FiCheck } from 'react-icons/fi';
import './styles.css';

const LIST_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
];

const LIST_ICONS = [
  'list', 'briefcase', 'home', 'shopping-bag', 'gift', 'heart', 
  'bookmark', 'star', 'flag', 'target', 'zap', 'award'
];

const ListEditor = ({ list, onClose }) => {
  const { updateList, deleteList } = useTodo();
  const [title, setTitle] = useState(list.title);
  const [color, setColor] = useState(list.color || LIST_COLORS[0]);
  const [icon, setIcon] = useState(list.icon || 'list');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateList(list.id, { title, color, icon });
      onClose();
    } catch (err) {
      console.error('Error saving list:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${list.title}" and all its tasks?`)) {
      await deleteList(list.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="list-editor-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit List</h3>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {LIST_COLORS.map(c => (
                <button
                  key={c}
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {LIST_ICONS.map(i => (
                <button
                  key={i}
                  className={`icon-option ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="delete-btn" onClick={handleDelete}>
            Delete List
          </button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            <FiCheck /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListEditor;