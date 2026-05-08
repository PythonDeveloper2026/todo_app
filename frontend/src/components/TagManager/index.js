import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';
import api from '../../api/axios';
import { FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './styles.css';

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
];

const TagManager = ({ onClose }) => {
  const { tags, setTags } = useTodo();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState(null);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      console.log('Creating tag:', { name: newTagName, color: selectedColor });
      const res = await api.post('/tags/', { name: newTagName, color: selectedColor });
      console.log('Response:', res.data);
      setTags(prev => [...prev, res.data]);
      setNewTagName('');
    } catch (err) {
      console.error('Error creating tag:', err.response?.data || err);
      alert('Error: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleUpdate = async (id) => {
    if (!editingTag.name.trim()) return;
    try {
      const res = await api.patch(`/tags/${id}/`, editingTag);
      setTags(prev => prev.map(t => t.id === id ? res.data : t));
      setEditingTag(null);
    } catch (err) {
      console.error('Error updating tag:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await api.delete(`/tags/${id}/`);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting tag:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tag-manager-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Tags</h3>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="create-tag-section">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="New tag name..."
            className="tag-input"
          />
          <div className="color-picker">
            {TAG_COLORS.map(color => (
              <button
                key={color}
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <button className="create-btn" onClick={handleCreate}>
            <FiPlus /> Create
          </button>
        </div>

        <div className="tags-list">
          {tags.map(tag => (
            <div key={tag.id} className="tag-item">
              {editingTag?.id === tag.id ? (
                <div className="tag-edit">
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={e => setEditingTag({ ...editingTag, name: e.target.value })}
                    className="tag-input"
                  />
                  <div className="color-picker small">
                    {TAG_COLORS.map(color => (
                      <button
                        key={color}
                        className={`color-option ${editingTag.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingTag({ ...editingTag, color })}
                      />
                    ))}
                  </div>
                  <div className="tag-actions">
                    <button onClick={() => handleUpdate(tag.id)}>Save</button>
                    <button onClick={() => setEditingTag(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="tag-display">
                  <span className="tag-badge" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                  <div className="tag-actions">
                    <button onClick={() => setEditingTag(tag)}><FiEdit2 /></button>
                    <button onClick={() => handleDelete(tag.id)}><FiTrash2 /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {tags.length === 0 && <p className="no-tags">No tags yet. Create one above!</p>}
        </div>
      </div>
    </div>
  );
};

export default TagManager;