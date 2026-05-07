import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTodo } from '../../context/TodoContext';
import { FiSun, FiStar, FiCalendar, FiList, FiSearch, FiPlus, FiSettings, FiLogOut, FiMenu, FiBarChart2 } from 'react-icons/fi';
import './styles.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { lists, stats, createList } = useTodo();
  const navigate = useNavigate();
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

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
        <div className="user-profile">
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
            {isOpen && stats?.today > 0 && <span className="badge">{stats.today}</span>}
          </NavLink>
          <NavLink to="/app/important" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Important">
            <FiStar /> {isOpen && <span>Important</span>}
            {isOpen && stats?.important > 0 && <span className="badge">{stats.important}</span>}
          </NavLink>
          <NavLink to="/app/planned" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="Planned">
            <FiCalendar /> {isOpen && <span>Planned</span>}
          </NavLink>
          <NavLink to="/app/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} title="All Tasks">
            <FiList /> {isOpen && <span>All Tasks</span>}
            {isOpen && stats?.pending > 0 && <span className="badge">{stats.pending}</span>}
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
              <form onSubmit={handleAddList} className="add-list-form">
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
              {lists.map(list => (
                <NavLink key={list.id} to={`/app/list/${list.id}`} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                  <span className="list-color" style={{ backgroundColor: list.color }}></span>
                  <span>{list.title}</span>
                  {list.total_tasks > 0 && <span className="badge">{list.total_tasks}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <button className="footer-btn" title="Settings">
            <FiSettings /> {isOpen && <span>Settings</span>}
          </button>
          <button className="footer-btn text-danger" onClick={handleLogout} title="Logout">
            <FiLogOut /> {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
