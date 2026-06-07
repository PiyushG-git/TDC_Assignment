import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Users, Heart, TrendingUp, UserPlus, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const BRAND_COLORS = ['#244c3c', '#dc9e4a', '#386058', '#7D5115', '#4a7c59', '#a0785a'];

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, customersRes] = await Promise.all([
          api.get('/customers/stats'),
          api.get('/customers?page=1&limit=5')
        ]);
        setStats(statsRes.data);
        setRecentCustomers(customersRes.data.customers || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid #244c3c', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#64748b', fontFamily: "'Inter Tight', sans-serif" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Customers', value: stats?.totalCustomers || 0,
      icon: Users, color: '#244c3c', bg: 'rgba(36,76,60,0.08)'
    },
    {
      title: 'Active Matches', value: stats?.activeMatches || 0,
      icon: Heart, color: '#dc9e4a', bg: 'rgba(220,158,74,0.1)'
    },
    {
      title: 'Match Success Rate', value: '68%',
      icon: TrendingUp, color: '#386058', bg: 'rgba(56,96,88,0.1)'
    },
    {
      title: 'New Leads', value: stats?.statusDistribution?.find(s => s._id === 'New Lead')?.count || 0,
      icon: UserPlus, color: '#7D5115', bg: 'rgba(125,81,21,0.08)'
    }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter Tight', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: '#1b3a2f', margin: '0 0 6px' }}>
          Good day, Matchmaker
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Here's what's happening across your client portfolio today.
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {metrics.map((m) => (
          <Card key={m.title}>
            <CardContent className="p-6">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                    {m.title}
                  </p>
                  <p style={{ fontSize: '36px', fontWeight: '700', color: '#1b3a2f', margin: 0, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                    {m.value}
                  </p>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <m.icon size={20} style={{ color: m.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '28px' }}>
        <Card>
          <CardHeader><CardTitle>Customer Journey Funnel</CardTitle></CardHeader>
          <CardContent className="p-6" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.statusDistribution || []} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: "'Inter Tight', sans-serif" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(36,76,60,0.04)' }}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontFamily: "'Inter Tight', sans-serif" }}
                />
                <Bar dataKey="count" fill="#244c3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Gender Distribution</CardTitle></CardHeader>
          <CardContent className="p-6" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.genderDistribution || []}
                  cx="50%" cy="45%"
                  innerRadius={65} outerRadius={100}
                  paddingAngle={4}
                  dataKey="count" nameKey="_id"
                >
                  {(stats?.genderDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'Inter Tight', sans-serif" }}>{value}</span>} />
                <RechartsTooltip contentStyle={{ borderRadius: '10px', fontFamily: "'Inter Tight', sans-serif" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle>Recently Added Profiles</CardTitle>
            <button
              onClick={() => navigate('/customers')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: '500', color: '#dc9e4a',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter Tight', sans-serif"
              }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
        </CardHeader>
        <div>
          {recentCustomers.map((c, i) => (
            <div
              key={c._id}
              onClick={() => navigate(`/customers/${c._id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 24px', cursor: 'pointer',
                borderTop: i > 0 ? '1px solid #f8f9fa' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdfbf7'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <img
                src={c.profilePicture}
                alt={c.firstName}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #f1f5f9' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '0 0 2px' }}>{c.firstName} {c.lastName}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.age} yrs · {c.city} · {c.designation}</p>
              </div>
              <Badge status={c.statusTag}>{c.statusTag}</Badge>
              <ArrowRight size={14} style={{ color: '#cbd5e1' }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
