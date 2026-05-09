import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/stats/'),
          api.get('/tasks/')
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data.results || tasksRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-container">Loading statistics...</div>;
  if (!stats) return <div className="page-container">Failed to load statistics.</div>;

  const completionData = [
    { name: 'Completed', value: stats.completed, color: '#4ade80' },
    { name: 'Pending', value: stats.pending, color: '#fbbf24' },
    { name: 'Overdue', value: stats.overdue, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Low', count: stats.by_priority?.low || 0, fill: '#4ade80' },
    { name: 'Medium', count: stats.by_priority?.medium || 0, fill: '#fbbf24' },
    { name: 'High', count: stats.by_priority?.high || 0, fill: '#f97316' },
    { name: 'Urgent', count: stats.by_priority?.urgent || 0, fill: '#ef4444' },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const overdueRate = stats.pending > 0 ? Math.round((stats.overdue / stats.pending) * 100) : 0;

  const getDateOnly = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const today = getDateOnly(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const laterDate = new Date(today);
  laterDate.setDate(laterDate.getDate() + 7);

  const dueDateData = [
    { name: 'Today', count: tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      const due = getDateOnly(t.due_date);
      return due && due.getTime() === today.getTime();
    }).length },
    { name: 'Tomorrow', count: tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      const due = getDateOnly(t.due_date);
      return due && due.getTime() === tomorrow.getTime();
    }).length },
    { name: 'This Week', count: tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      const due = getDateOnly(t.due_date);
      return due && due > today && due <= weekEnd;
    }).length },
    { name: 'Later', count: tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      const due = getDateOnly(t.due_date);
      return due && due > weekEnd;
    }).length },
    { name: 'No Due Date', count: tasks.filter(t => !t.due_date && !t.is_completed).length },
  ];

  const listData = [];
  const listMap = {};
  tasks.forEach(t => {
    if (t.todo_list) {
      if (!listMap[t.todo_list]) {
        listMap[t.todo_list] = { name: t.todo_list_name || 'List', count: 0 };
      }
      if (!t.is_completed) listMap[t.todo_list].count++;
    }
  });
  Object.values(listMap).forEach(l => {
    if (l.count > 0) listData.push(l);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Statistics Dashboard</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px' }}>Total Tasks</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px' }}>Completed</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>{stats.completed}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px' }}>Pending</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>{stats.pending}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px' }}>Overdue</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{stats.overdue}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px' }}>Completion Rate</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>{completionRate}%</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px' }}>Overdue Rate</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{overdueRate}%</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>Task Status Distribution</h3>
          {completionData.length > 0 ? (
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-secondary" style={{ textAlign: 'center', marginTop: '40px' }}>No data to display</p>
          )}
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>Pending Tasks by Priority</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} fontSize={12} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>Tasks by Due Date</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dueDateData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} fontSize={12} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {listData.length > 0 && (
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}>Tasks by List</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis type="number" stroke="var(--text-secondary)" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={12} width={100} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;