import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const STATUS_TAGS = ['All', 'New Lead', 'Profile Review', 'Searching', 'Match Sent', 'Matched', 'Inactive'];

export const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const navigate = useNavigate();

  const fetchCustomers = async (p = 1, s = search, status = activeStatus) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (s) params.set('search', s);
      if (status && status !== 'All') params.set('statusTag', status);
      const { data } = await api.get(`/customers?${params.toString()}`);
      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 1);
      setTotalCustomers(data.totalCustomers || 0);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, search, activeStatus);
  }, [page, search, activeStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusFilter = (status) => {
    setActiveStatus(status);
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter Tight', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: '#1b3a2f', margin: '0 0 4px' }}>
            Client Profiles
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            {totalCustomers} clients in your portfolio
          </p>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px',
                borderRadius: '999px', border: '1.5px solid #e2e8f0', fontSize: '13px',
                outline: 'none', width: '260px', fontFamily: "'Inter Tight', sans-serif",
                backgroundColor: '#ffffff', color: '#1e293b'
              }}
              onFocus={(e) => e.target.style.borderColor = '#244c3c'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </form>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {STATUS_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleStatusFilter(tag)}
            style={{
              padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: '500',
              cursor: 'pointer', border: '1.5px solid',
              fontFamily: "'Inter Tight', sans-serif", transition: 'all 0.15s',
              borderColor: activeStatus === tag ? '#244c3c' : '#e2e8f0',
              backgroundColor: activeStatus === tag ? '#244c3c' : '#ffffff',
              color: activeStatus === tag ? '#ffffff' : '#64748b'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            Loading profiles...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            No customers found.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Profile', 'Age & Height', 'Location', 'Education & Career', 'Religion', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#fafafa' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/customers/${c._id}`)}
                    style={{
                      borderBottom: i < customers.length - 1 ? '1px solid #f8f9fa' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdfbf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={c.profilePicture}
                          alt={c.firstName}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9', flexShrink: 0 }}
                        />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '0 0 2px' }}>{c.firstName} {c.lastName}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.gender} · {c.maritalStatus}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 2px' }}>{c.age} yrs</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.height} cm</p>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#374151' }}>
                      <p style={{ margin: '0 0 2px' }}>{c.city}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.country}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 2px' }}>{c.designation}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.company}</p>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#374151' }}>
                      <p style={{ margin: '0 0 2px' }}>{c.religion}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{c.caste}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge status={c.statusTag}>{c.statusTag}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Page {page} of {totalPages} · {totalCustomers} total profiles
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                    fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1, backgroundColor: '#fff',
                    color: '#374151', fontFamily: "'Inter Tight', sans-serif"
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                    fontSize: '13px', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1, backgroundColor: '#fff',
                    color: '#374151', fontFamily: "'Inter Tight', sans-serif"
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
