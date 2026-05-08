import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useKeyboardShortcuts = (shortcuts = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      
      if (e.key === 'Escape') {
        if (shortcuts.onEscape) shortcuts.onEscape();
        return;
      }
      
      if (shortcuts[key]) {
        e.preventDefault();
        if (typeof shortcuts[key] === 'function') {
          shortcuts[key]();
        } else if (typeof shortcuts[key] === 'string') {
          navigate(shortcuts[key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, navigate]);
};

export default useKeyboardShortcuts;