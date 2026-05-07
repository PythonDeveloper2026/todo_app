import React, { useState, useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import TaskCard from '../components/TaskCard';
import { FiSearch } from 'react-icons/fi';
import api from '../api/axios';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], lists: [], tags: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/search/?q=${query}`);
          setResults(res.data);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults({ tasks: [], lists: [], tags: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Search</h2>
      </div>

      <div className="search-input-container" style={{ marginBottom: '20px', position: 'relative' }}>
        <FiSearch style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-secondary)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, lists, tags..."
          className="input-field"
          style={{ paddingLeft: '40px' }}
          autoFocus
        />
      </div>

      <div className="search-results">
        {isSearching ? (
          <p>Searching...</p>
        ) : query.length > 0 && query.length < 2 ? (
          <p className="text-secondary">Type at least 2 characters to search...</p>
        ) : (
          <>
            {results.tasks.length > 0 && (
              <div className="result-section" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Tasks</h3>
                <div className="tasks-list">
                  {results.tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {results.lists.length > 0 && (
              <div className="result-section" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Lists</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {results.lists.map(list => (
                    <div key={list.id} style={{ padding: '10px 15px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: list.color }}></span>
                      {list.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {query.length >= 2 && results.tasks.length === 0 && results.lists.length === 0 && results.tags.length === 0 && (
              <p className="text-secondary">No results found for "{query}"</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
