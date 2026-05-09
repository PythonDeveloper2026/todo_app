import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTodo } from '../../context/TodoContext';
import TagManager from '../TagManager';
import ListEditor from '../ListEditor';
import { FiSun, FiStar, FiCalendar, FiList, FiSearch, FiPlus, FiSettings, FiLogOut, FiMenu, FiBarChart2, FiTag, FiMoreVertical, FiBriefcase, FiHome, FiShoppingBag, FiGift, FiHeart, FiBookmark, FiFlag, FiZap, FiAward, FiTarget } from 'react-icons/fi';
import './styles.css';

const ICON_MAP = {
  list: FiList,
  briefcase: FiBriefcase,
  home: FiHome,
  'shopping-bag': FiShoppingBag,
  gift: FiGift,
  heart: FiHeart,
  bookmark: FiBookmark,
  star: FiStar,
  flag: FiFlag,
  target: FiTarget,
  zap: FiZap,
  award: FiAward,
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { lists, createList, tasks, fetchTasks } = useTodo();
  const navigate = useNavigate();
  
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const addListRef = useRef(null);

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const myDayCount = incompleteTasks.filter(t => t.is_my_day).length;
  const importantCount = incompleteTasks.filter(t => t.is_important).length;
  const plannedCount = incompleteTasks.filter(t => t.due_date && new Date(t.due_date) >= new Date()).length;
  const allTasksCount = incompleteTasks.length;

  const getListTaskCount = (listId) => {
    return incompleteTasks.filter(t => t.todo_list === listId).length;
  };

  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [fetchTasks, tasks.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isAddingList && addListRef.current && !addListRef.current.contains(e.target)) {
        setIsAddingList(false);
        setNewListName('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddingList]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      createList({ title: newListName });
      setNewListName('');
      setIsAddingList(false);
    }
  };

  return (
    <>
      <button className={`sidebar-toggle-btn ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}>
        <FiMenu size={24} />
      </button>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="user-profile" onClick={() => navigate('/app/settings')} style={{ cursor: 'pointer' }}>
          <div className="avatar">
            {user?.avatar_url ? <img src={user.avatar_url} alt="avatar" /> : <span>{user?.username?.[0]?.toUpperCase()}</span>}
          </div>
          {isOpen && (
            <div className="user-info">
              <h4>{user?.first_name || user?.username}</h4>
              <p className="text-secondary">{user?.email}</p>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="search-bar" onClick={() => navigate('/app/search')}>
            <FiSearch />
            <span>Search...</span>
          </div>
        )}

        <nav className="nav-menu">
          <NavLink to="/app/my-day" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="My Day">
            <FiSun /> {isOpen && <span>My Day</span>}
            {isOpen && myDayCount > 0 && <span className="badge">{myDayCount}</span>}
          </NavLink>
          <NavLink to="/app/important" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Important">
            <FiStar /> {isOpen && <span>Important</span>}
            {isOpen && importantCount > 0 && <span className="badge">{importantCount}</span>}
          </NavLink>
          <NavLink to="/app/planned" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Planned">
            <FiCalendar /> {isOpen && <span>Planned</span>}
            {isOpen && plannedCount > 0 && <span className="badge">{plannedCount}</span>}
          </NavLink>
          <NavLink to="/app/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="All Tasks">
            <FiList /> {isOpen && <span>All Tasks</span>}
            {isOpen && allTasksCount > 0 && <span className="badge">{allTasksCount}</span>}
          </NavLink>
          <NavLink to="/app/stats" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Statistics">
            <FiBarChart2 /> {isOpen && <span>Statistics</span>}
          </NavLink>
        </nav>

        {isOpen && (
          <div className="lists-section">
            <div className="lists-header">
              <h4>My Lists</h4>
              <button onClick={() => setIsAddingList(!isAddingList)}><FiPlus /></button>
            </div>
            
            {isAddingList && (
              <form onSubmit={handleAddList} className="add-list-form" ref={addListRef}>
                <input 
                  autoFocus
                  type="text" 
                  value={newListName} 
                  onChange={e => setNewListName(e.target.value)} 
                  placeholder="List name..." 
                  className="input-field list-input"
                />
              </form>
            )}

            <div className="user-lists">
              {lists.map(list => {
                const IconComponent = ICON_MAP[list.icon] || FiList;
                const taskCount = getListTaskCount(list.id);
                return (
                  <div key={list.id} className="list-item-wrapper">
                    <NavLink to={`/app/list/${list.id}`} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                      <span className="list-icon" style={{ color: list.color }}><IconComponent size={16} /></span>
                      <span>{list.title}</span>
                      {taskCount > 0 && <span className="badge">{taskCount}</span>}
                    </NavLink>
                    <button className="list-edit-btn" onClick={() => setEditingList(list)}>
                      <FiMoreVertical />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="tags-section">
            <div className="tags-header">
              <h4>Tags</h4>
              <button onClick={() => setShowTagManager(true)}><FiTag /></button>
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={() => navigate('/app/settings')} title="Settings">
            <FiSettings /> {isOpen && <span>Settings</span>}
          </button>
          <button className="footer-btn text-danger" onClick={handleLogout} title="Logout">
            <FiLogOut /> {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {showTagManager && <TagManager onClose={() => setShowTagManager(false)} />}
      {editingList && <ListEditor list={editingList} onClose={() => setEditingList(null)} />}
    </>
  );
};

export default Sidebar;