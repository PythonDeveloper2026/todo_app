import React, { useState, useEffect } from 'react';
import { useTodo } from '../../context/TodoContext';
import api from '../../api/axios';
import { 
  FiX, FiStar, FiCalendar, FiClock, FiTag, FiCheck, FiTrash2,
  FiPlus, FiAlertCircle, FiSave, FiList 
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles.css';

const priorityLabels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };
const priorityColors = {
  1: 'var(--priority-low)',
  2: 'var(--priority-medium)', 
  3: 'var(--priority-high)',
  4: 'var(--priority-urgent)'
};

const TaskDetailModal = ({ task, onClose, isNew, onSave }) => {
  const { createTask, updateTask, deleteTask, toggleComplete, tags: allTags, lists } = useTodo();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 1,
    due_date: task?.due_date ? new Date(task.due_date) : null,
    reminder_date: task?.reminder_date ? new Date(task.reminder_date) : null,
    todo_list: task?.todo_list,
    is_important: task?.is_important || false,
    is_my_day: task?.is_my_day || false,
  });
  
  const [taskTags, setTaskTags] = useState(task.tags || []);
  const [steps, setSteps] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && task?.id) {
      loadTaskDetails();
    }
  }, [task?.id, isNew]);

  const loadTaskDetails = async () => {
    if (!task?.id) return;
    setLoading(true);
    try {
      const [stepsRes, notesRes] = await Promise.all([
        api.get(`/tasks/${task.id}/steps/`),
        api.get(`/tasks/${task.id}/notes/`),
      ]);
      setSteps(stepsRes.data.results || stepsRes.data);
      setNotes(notesRes.data.results || notesRes.data);
    } catch (err) {
      console.error('Error loading task details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!formData.title.trim()) return;
    setSaving(true);
    
    const dataToSave = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      is_important: formData.is_important,
      is_my_day: formData.is_my_day,
      todo_list: formData.todo_list,
    };
    
    if (formData.due_date) {
      dataToSave.due_date = formData.due_date.toISOString();
    }
    if (formData.reminder_date) {
      dataToSave.reminder_date = formData.reminder_date.toISOString();
    }
    
    try {
      let savedTask;
      if (isNew) {
        console.log('Creating new task with data:', dataToSave);
        savedTask = await createTask(dataToSave);
        console.log('Created task:', savedTask);
        if (onSave) onSave(savedTask);
        onClose();
      } else {
        savedTask = await updateTask(task.id, dataToSave);
        setFormData(savedTask);
        onClose();
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error saving task: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSave = async (field, value) => {
    if (isNew) {
      setFormData(prev => ({ ...prev, [field]: value }));
      return;
    }
    setSaving(true);
    let dataToSave = { [field]: value };
    if (field === 'due_date' || field === 'reminder_date') {
      dataToSave[field] = value ? value.toISOString() : null;
    }
    try {
      await api.patch(`/tasks/${task.id}/`, dataToSave);
      setFormData(prev => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStep.trim()) return;
    try {
      const res = await api.post(`/tasks/${task.id}/steps/`, { title: newStep });
      setSteps(prev => [...prev, res.data]);
      setNewStep('');
    } catch (err) {
      console.error('Error adding step:', err);
    }
  };

  const handleToggleStep = async (stepId) => {
    try {
      await api.post(`/steps/${stepId}/complete/`);
      setSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, is_completed: !s.is_completed } : s
      ));
    } catch (err) {
      console.error('Error toggling step:', err);
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await api.delete(`/steps/${stepId}/`);
      setSteps(prev => prev.filter(s => s.id !== stepId));
    } catch (err) {
      console.error('Error deleting step:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post(`/tasks/${task.id}/notes/`, { content: newNote });
      setNotes(prev => [...prev, res.data]);
      setNewNote('');
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}/`);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleToggleTag = async (tag) => {
    console.log('Toggle tag:', tag, 'Current tags:', taskTags);
    const isSelected = taskTags.some(t => t.id === tag.id);
    const newTags = isSelected 
      ? taskTags.filter(t => t.id !== tag.id)
      : [...taskTags, tag];
    
    try {
      await api.post(`/tasks/${task.id}/tags/`, { tags: newTags.map(t => t.id) });
      setTaskTags(newTags);
    } catch (err) {
      console.error('Error toggling tag:', err.response || err);
      alert('Error: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleToggleImportant = () => {
    if (isNew) {
      setFormData(prev => ({ ...prev, is_important: !prev.is_important }));
      return;
    }
    try {
      api.post(`/tasks/${task.id}/important/`);
      setFormData(prev => ({ ...prev, is_important: !prev.is_important }));
    } catch (err) {
      console.error('Error toggling important:', err);
    }
  };

  const handleToggleMyDay = () => {
    if (isNew) {
      setFormData(prev => ({ ...prev, is_my_day: !prev.is_my_day }));
      return;
    }
    try {
      api.post(`/tasks/${task.id}/my-day/`);
      setFormData(prev => ({ ...prev, is_my_day: !prev.is_my_day }));
    } catch (err) {
      console.error('Error toggling my day:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const completedSteps = steps.filter(s => s.is_completed).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            {!isNew && (
              <div 
                className={`checkbox ${task?.is_completed ? 'checked' : ''}`}
                onClick={() => toggleComplete(task.id)}
              >
                {task?.is_completed && <FiCheck />}
              </div>
            )}
            <input
              type="text"
              className="title-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              onBlur={() => handleQuickSave('title', formData.title)}
            />
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="quick-actions">
            <button
              className={`action-btn ${formData.is_my_day ? 'active' : ''}`}
              onClick={handleToggleMyDay}
            >
              My Day
            </button>
            <button
              className={`action-btn ${formData.is_important ? 'active star' : ''}`}
              onClick={handleToggleImportant}
            >
              <FiStar fill={formData.is_important ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="detail-section">
            <label><FiList /> List</label>
            <select
              className="list-select"
              value={formData.todo_list || ''}
              onChange={e => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setFormData({ ...formData, todo_list: value });
                if (!isNew) handleQuickSave('todo_list', value);
              }}
            >
              <option value="">No List</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.title}</option>
              ))}
            </select>
          </div>

          <div className="detail-section">
            <label><FiCalendar /> Due Date</label>
            <DatePicker
              selected={formData.due_date}
              onChange={date => {
                setFormData({ ...formData, due_date: date });
                handleQuickSave('due_date', date);
              }}
              showTimeSelect
              dateFormat="MMM d, yyyy h:mm a"
              placeholderText="Set due date"
              className="date-input"
              minDate={new Date()}
            />
          </div>

          <div className="detail-section">
            <label><FiClock /> Reminder</label>
            <DatePicker
              selected={formData.reminder_date}
              onChange={date => {
                setFormData({ ...formData, reminder_date: date });
                handleQuickSave('reminder_date', date);
              }}
              showTimeSelect
              dateFormat="MMM d, yyyy h:mm a"
              placeholderText="Set reminder"
              className="date-input"
              minDate={new Date()}
            />
          </div>

          <div className="detail-section">
            <label><FiAlertCircle /> Priority</label>
            <div className="priority-buttons">
              {[1, 2, 3, 4].map(p => (
                <button
                  key={p}
                  className={`priority-btn ${formData.priority === p ? 'active' : ''}`}
                  style={{ '--priority-color': priorityColors[p] }}
                  onClick={() => {
                    setFormData({ ...formData, priority: p });
                    handleQuickSave('priority', p);
                  }}
                >
                  {priorityLabels[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <label><FiTag /> Tags</label>
            <div className="tags-container">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-btn ${taskTags.some(t => t.id === tag.id) ? 'active' : ''}`}
                  style={{ '--tag-color': tag.color }}
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag.name}
                </button>
              ))}
              {allTags.length === 0 && <span className="no-tags">No tags yet</span>}
            </div>
          </div>

          <div className="detail-section">
            <label>
              Steps 
              {steps.length > 0 && <span className="steps-count">{completedSteps}/{steps.length}</span>}
            </label>
            <div className="steps-list">
              {steps.map(step => (
                <div key={step.id} className="step-item">
                  <div 
                    className={`checkbox small ${step.is_completed ? 'checked' : ''}`}
                    onClick={() => handleToggleStep(step.id)}
                  >
                    {step.is_completed && <FiCheck />}
                  </div>
                  <span className={step.is_completed ? 'completed' : ''}>{step.title}</span>
                  <button className="delete-step-btn" onClick={() => handleDeleteStep(step.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-step-input">
              <input
                type="text"
                value={newStep}
                onChange={e => setNewStep(e.target.value)}
                placeholder="Add a step..."
                onKeyPress={e => e.key === 'Enter' && handleAddStep()}
              />
              <button onClick={handleAddStep}><FiPlus /></button>
            </div>
          </div>

          <div className="detail-section">
            <label>Notes</label>
            <div className="notes-list">
              {notes.map(note => (
                <div key={note.id} className="note-item">
                  <p>{note.content}</p>
                  <button className="delete-note-btn" onClick={() => handleDeleteNote(note.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-note-input">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={2}
              />
              <button onClick={handleAddNote}><FiPlus /></button>
            </div>
          </div>

          <div className="detail-section">
            <label>Description</label>
            <textarea
              className="description-input"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => handleQuickSave('description', formData.description)}
              placeholder="Add description..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          {!isNew && (
            <button className="delete-task-btn" onClick={handleDelete}>
              <FiTrash2 /> Delete Task
            </button>
          )}
          <button 
            className="save-task-btn" 
            onClick={handleSaveAll}
            disabled={saving || !formData.title.trim()}
          >
            <FiSave /> {saving ? 'Saving...' : (isNew ? 'Create Task' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;