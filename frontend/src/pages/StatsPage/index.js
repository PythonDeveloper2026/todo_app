import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/');
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="page-container">Loading statistics...</div>;
  if (!stats) return <div className="page-container">Failed to load statistics.</div>;

  // Pie chart ma'lumotlari (bajarilgan vs kutilayotgan)
  const completionData = [
    { name: 'Completed', value: stats.completed, color: '#4ade80' },
    { name: 'Pending', value: stats.pending, color: '#fbbf24' },
    { name: 'Overdue', value: stats.overdue, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Bar chart ma'lumotlari (ustuvorlik bo'yicha)
  const priorityData = [
    { name: 'Low', count: stats.by_priority.low, fill: '#4ade80' },
    { name: 'Medium', count: stats.by_priority.medium, fill: '#fbbf24' },
    { name: 'High', count: stats.by_priority.high, fill: '#f97316' },
    { name: 'Urgent', count: stats.by_priority.urgent, fill: '#ef4444' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Statistics Dashboard</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '10px' }}>Total Tasks</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '10px' }}>Completed</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--success)' }}>{stats.completed}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '10px' }}>Pending</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--warning)' }}>{stats.pending}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 className="text-secondary" style={{ fontSize: '14px', marginBottom: '10px' }}>Overdue</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.overdue}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        {/* Pie Chart: Task Status */}
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Task Status Distribution</h3>
          {completionData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-secondary" style={{ textAlign: 'center', marginTop: '50px' }}>No data to display</p>
          )}
        </div>

        {/* Bar Chart: Priority */}
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Pending Tasks by Priority</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
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
    </div>
  );
};

export default StatsPage;
