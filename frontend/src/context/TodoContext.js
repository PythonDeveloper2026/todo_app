import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLists = useCallback(async () => {
    const res = await api.get('/lists/');
    setLists(res.data.results || res.data);
  }, []);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/', { params });
      setTasks(res.data.results || res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await api.get('/stats/');
    setStats(res.data);
  }, []);

  const fetchTags = useCallback(async () => {
    const res = await api.get('/tags/');
    setTags(res.data.results || res.data);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLists();
      fetchTags();
      fetchStats();
    }
  }, [user, fetchLists, fetchTags, fetchStats]);

  // Task CRUD operatsiyalari
  const createTask = async (data) => {
    const res = await api.post('/tasks/', data);
    setTasks(prev => [res.data, ...prev]);
    fetchStats();
    return res.data;
  };

  const updateTask = async (id, data) => {
    const res = await api.patch(`/tasks/${id}/`, data);
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
    return res.data;
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}/`);
    setTasks(prev => prev.filter(t => t.id !== id));
    fetchStats();
  };

  const toggleComplete = async (id) => {
    const res = await api.post(`/tasks/${id}/complete/`);
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
    fetchStats();
  };

  const toggleImportant = async (id) => {
    const res = await api.post(`/tasks/${id}/important/`);
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
  };

  const toggleMyDay = async (id) => {
    const res = await api.post(`/tasks/${id}/my-day/`);
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
  };

  // List CRUD
  const createList = async (data) => {
    const res = await api.post('/lists/', data);
    setLists(prev => [...prev, res.data]);
    return res.data;
  };

  const updateList = async (id, data) => {
    const res = await api.patch(`/lists/${id}/`, data);
    setLists(prev => prev.map(l => l.id === id ? res.data : l));
    return res.data;
  };

  const deleteList = async (id) => {
    await api.delete(`/lists/${id}/`);
    setLists(prev => prev.filter(l => l.id !== id));
  };

  return (
    <TodoContext.Provider value={{
      lists, tasks, tags, stats, activeList, loading,
      setActiveList, fetchTasks, fetchStats,
      createTask, updateTask, deleteTask,
      toggleComplete, toggleImportant, toggleMyDay,
      createList, updateList, deleteList,
    }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);
