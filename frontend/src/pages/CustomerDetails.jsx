import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Bot, MapPin, Briefcase, Heart, Send, Sparkles, ArrowLeft, Trash2, CheckCircle, Mail } from 'lucide-react';

// --- Sub-components ---
const DetailItem = ({ label, value }) => (
  <div style={{ padding: '0' }}>
    <dt style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</dt>
    <dd style={{ fontSize: '14px', color: '#1e293b', margin: 0 }}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</dd>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(27,58,47,0.06)' }}>
    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1b3a2f', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
      {title}
    </h3>
    {children}
  </div>
);

const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: type === 'success' ? '#1b3a2f' : '#dc2626',
    color: '#fff', padding: '14px 20px', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    fontFamily: "'Inter Tight', sans-serif", fontSize: '14px',
    animation: 'slideIn 0.3s ease'
  }}>
    <CheckCircle size={16} style={{ color: '#dc9e4a' }} />
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginLeft: '8px', fontSize: '16px' }}>×</button>
  </div>
);

// --- Main Component ---
export const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [matchResponse, setMatchResponse] = useState(null);
  const [sendingMatch, setSendingMatch] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [custRes, notesRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/customers/${id}/notes`)
        ]);
        setCustomer(custRes.data);
        setNotes(notesRes.data);
      } catch (error) {
        console.error('Failed to fetch customer details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const { data } = await api.post(`/customers/${id}/notes`, { content: newNote });
      setNotes([data, ...notes]);
      setNewNote('');
      showToast('Note added successfully');
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  const handleSuggestMatches = async () => {
    setMatchesLoading(true);
    try {
      const { data } = await api.get(`/matches/suggest/${id}`);
      setMatches(data);
    } catch (error) {
      console.error('Failed to suggest matches', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleOpenModal = async (match) => {
    setSelectedMatch(match);
    setShowModal(true);
    setMatchResponse(null);
    setAiAnalysis(null);
    // Fetch AI analysis
    setLoadingAI(true);
    try {
      const { data } = await api.post('/matches/ai-compatibility', {
        customerId: id,
        matchedCustomerId: match.candidate._id
      });
      setAiAnalysis(data);
    } catch (err) {
      console.error('AI analysis failed', err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSendMatch = async () => {
    if (!selectedMatch) return;
    setSendingMatch(true);
    try {
      const { data } = await api.post('/matches/send', {
        customerId: id,
        matchedCustomerId: selectedMatch.candidate._id,
        score: selectedMatch.score,
        reason: selectedMatch.reason
      });
      setMatchResponse(data);
      // Update local status
      setCustomer(prev => ({ ...prev, statusTag: 'Match Sent' }));
      showToast(`Match sent successfully to ${selectedMatch.candidate.firstName}!`);
    } catch (error) {
      console.error('Failed to send match', error);
      showToast('Failed to send match', 'error');
    } finally {
      setSendingMatch(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: '#94a3b8', fontFamily: "'Inter Tight', sans-serif" }}>Loading profile...</p>
      </div>
    );
  }
  if (!customer) {
    return <div style={{ padding: '2rem', color: '#94a3b8' }}>Customer not found.</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter Tight', sans-serif" }}>
      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back button */}
      <button
        onClick={() => navigate('/customers')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', color: '#64748b', background: 'none', border: 'none',
          cursor: 'pointer', marginBottom: '20px', fontFamily: "'Inter Tight', sans-serif",
          padding: 0
        }}
      >
        <ArrowLeft size={14} /> Back to Clients
      </button>

      {/* Profile Hero Card */}
      <div style={{
        borderRadius: '20px', overflow: 'hidden', marginBottom: '24px',
        background: 'linear-gradient(135deg, #1b3a2f 0%, #244c3c 60%, #386058 100%)',
        position: 'relative'
      }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(220,158,74,0.2)' }} />
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(220,158,74,0.15)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', padding: '32px 36px', position: 'relative' }}>
          <img
            src={customer.profilePicture}
            alt={customer.firstName}
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(220,158,74,0.5)', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600',
                color: '#ffffff', margin: 0
              }}>
                {customer.firstName} {customer.lastName}
              </h1>
              <Badge status={customer.statusTag} className="mt-1">{customer.statusTag}</Badge>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#dc9e4a' }}>◆</span> {customer.age} yrs · {customer.height} cm · {customer.gender}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} style={{ color: '#dc9e4a' }} /> {customer.city}, {customer.country}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={13} style={{ color: '#dc9e4a' }} /> {customer.designation} at {customer.company}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Heart size={13} style={{ color: '#dc9e4a' }} /> {customer.maritalStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
        marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(27,58,47,0.06)',
        borderLeft: '4px solid #dc9e4a'
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #244c3c, #1b3a2f)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={18} style={{ color: '#dc9e4a' }} />
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#dc9e4a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
            AI Profile Summary
          </p>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
            {customer.aiSummary || 'Generating AI summary...'}
          </p>
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Personal Details */}
        <SectionCard title="Personal Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DetailItem label="Date of Birth" value={customer.dob ? new Date(customer.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
            <DetailItem label="Mother Tongue" value={customer.motherTongue} />
            <DetailItem label="Religion" value={customer.religion} />
            <DetailItem label="Caste" value={customer.caste} />
            <DetailItem label="Family Type" value={customer.familyType} />
            <DetailItem label="Siblings" value={customer.siblings !== undefined ? `${customer.siblings} sibling(s)` : null} />
            <DetailItem label="Languages Known" value={Array.isArray(customer.languages) ? customer.languages.join(', ') : customer.languages} />
            <DetailItem label="Personality" value={customer.personalityType} />
          </div>
        </SectionCard>

        {/* Professional Details */}
        <SectionCard title="Professional Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DetailItem label="Company" value={customer.company} />
            <DetailItem label="Designation" value={customer.designation} />
            <DetailItem label="Annual Income" value={customer.income ? `₹${(customer.income / 100000).toFixed(1)} LPA` : null} />
            <DetailItem label="College" value={customer.college} />
            <DetailItem label="Degree" value={customer.degree} />
            <DetailItem label="Email" value={customer.email} />
            <DetailItem label="Phone" value={customer.phone} />
          </div>
        </SectionCard>
      </div>

      {/* Preferences & Lifestyle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <SectionCard title="Lifestyle Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DetailItem label="Diet" value={customer.dietPreference} />
            <DetailItem label="Smoking" value={customer.smoking} />
            <DetailItem label="Drinking" value={customer.drinking} />
            <DetailItem label="Open to Pets" value={customer.pets} />
            <DetailItem label="Hobbies" value={Array.isArray(customer.hobbies) ? customer.hobbies.join(', ') : customer.hobbies} />
            <DetailItem label="Interests" value={Array.isArray(customer.interests) ? customer.interests.join(', ') : customer.interests} />
          </div>
        </SectionCard>

        <SectionCard title="Partner Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <DetailItem label="Wants Kids" value={customer.wantKids} />
            <DetailItem label="Open to Relocate" value={customer.relocate} />
          </div>
          <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#fdfbf7', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
              Based on their profile, this client is looking for a compatible partner who shares their values around family, lifestyle, and long-term goals.
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Bottom row: Notes + Matches */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Notes Panel */}
        <SectionCard title="Matchmaker Notes">
          <form onSubmit={handleAddNote} style={{ marginBottom: '16px' }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a quick note from this client's call or meeting..."
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', fontSize: '13px', resize: 'vertical',
                fontFamily: "'Inter Tight', sans-serif", outline: 'none',
                boxSizing: 'border-box', color: '#374151', lineHeight: '1.5'
              }}
              onFocus={(e) => e.target.style.borderColor = '#244c3c'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={!newNote.trim()}
                style={{
                  padding: '8px 20px', borderRadius: '999px', border: 'none',
                  background: 'linear-gradient(145deg, #244c3c, #1b3a2f)',
                  boxShadow: '0px 1px 1px rgba(37,37,39,0.15), inset 0px 1px 2px 2px #386058',
                  color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  fontFamily: "'Inter Tight', sans-serif"
                }}
              >
                Add Note
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {notes.length === 0 && (
              <p style={{ color: '#cbd5e1', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No notes yet.</p>
            )}
            {notes.map((note) => (
              <div key={note._id} style={{ backgroundColor: '#fdfbf7', borderRadius: '10px', padding: '12px 14px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px', lineHeight: '1.5' }}>{note.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                  <span>By {note.matchmakerId?.username}</span>
                  <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Matching Engine */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(27,58,47,0.06)' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#1b3a2f', margin: 0 }}>Top Matches</h3>
            <button
              onClick={handleSuggestMatches}
              disabled={matchesLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '999px', border: 'none',
                background: matchesLoading ? '#e2e8f0' : 'linear-gradient(145deg, #244c3c, #1b3a2f)',
                boxShadow: matchesLoading ? 'none' : '0px 1px 1px rgba(37,37,39,0.15), inset 0px 1px 2px 2px #386058',
                color: matchesLoading ? '#94a3b8' : '#fff', fontSize: '12px', fontWeight: '500',
                cursor: matchesLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter Tight', sans-serif"
              }}
            >
              <Sparkles size={13} />
              {matchesLoading ? 'Finding...' : 'Run Engine'}
            </button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {matches.length === 0 && !matchesLoading && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#cbd5e1', fontSize: '13px' }}>
                <Sparkles size={28} style={{ margin: '0 auto 12px', color: '#e2e8f0', display: 'block' }} />
                Click "Run Engine" to find compatible matches
              </div>
            )}
            {matches.map((match, idx) => (
              <div
                key={match.candidate._id}
                style={{
                  padding: '14px 20px', borderBottom: idx < matches.length - 1 ? '1px solid #f8f9fa' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={match.candidate.profilePicture}
                    alt={match.candidate.firstName}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', margin: '0 0 2px' }}>
                      {match.candidate.firstName} {match.candidate.lastName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                      {match.candidate.age} yrs · {match.candidate.city} · {match.candidate.designation}
                    </p>
                  </div>
                  {/* Score badge */}
                  <div style={{
                    padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                    backgroundColor: match.score >= 70 ? '#dcfce7' : match.score >= 50 ? '#fef3c7' : '#fee2e2',
                    color: match.score >= 70 ? '#14532d' : match.score >= 50 ? '#78350f' : '#7f1d1d'
                  }}>
                    {match.score}%
                  </div>
                </div>

                {/* Dimension breakdown mini bars */}
                {match.breakdown && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {Object.entries(match.breakdown).map(([dim, { score: s, max }]) => {
                      const pct = Math.round((s / max) * 100);
                      const barColor = pct >= 75 ? '#244c3c' : pct >= 45 ? '#dc9e4a' : '#e2e8f0';
                      return (
                        <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', width: '60px', flexShrink: 0, textAlign: 'right' }}>{dim}</span>
                          <div style={{ flex: 1, height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', width: '28px', flexShrink: 0 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 10px', lineHeight: '1.5' }}>
                  {match.reason.slice(0, 120)}{match.reason.length > 120 ? '...' : ''}
                </p>
                <button
                  onClick={() => handleOpenModal(match)}
                  style={{
                    width: '100%', padding: '7px 0', borderRadius: '8px',
                    border: '1.5px solid #244c3c', backgroundColor: 'transparent',
                    color: '#244c3c', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                    fontFamily: "'Inter Tight', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Send size={12} /> Review & Send Match
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Send Match Modal */}
      {showModal && selectedMatch && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflow: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#1b3a2f', margin: 0 }}>Send Match Suggestion</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {!matchResponse ? (
                <>
                  {/* Profile cards */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <img src={customer.profilePicture} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #244c3c', marginBottom: '6px' }} />
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{customer.firstName}</p>
                    </div>
                    <div style={{ fontSize: '28px', color: '#dc9e4a', fontFamily: "'Playfair Display', serif" }}>♥</div>
                    <div style={{ textAlign: 'center' }}>
                      <img src={selectedMatch.candidate.profilePicture} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dc9e4a', marginBottom: '6px' }} />
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{selectedMatch.candidate.firstName}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#14532d' }}>
                      <Sparkles size={14} style={{ color: '#16a34a' }} />
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>Algorithm Score: {selectedMatch.score}/100</span>
                    </div>
                  </div>

                  {/* Engine Reasoning */}
                  <div style={{ backgroundColor: '#fdfbf7', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Matching Engine Reasoning</p>
                    <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{selectedMatch.reason}</p>
                  </div>

                  {/* AI Analysis */}
                  {loadingAI && (
                    <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>🤖 Generating AI compatibility analysis...</p>
                    </div>
                  )}
                  {aiAnalysis && (
                    <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>AI Compatibility Analysis</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                        <div>
                          <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', margin: '0 0 4px' }}>Strengths</p>
                          {(aiAnalysis.strengths || []).map((s, i) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 3px' }}>• {s}</p>)}
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', margin: '0 0 4px' }}>Considerations</p>
                          {(aiAnalysis.concerns || []).map((c, i) => <p key={i} style={{ fontSize: '12px', color: '#374151', margin: '0 0 3px' }}>• {c}</p>)}
                        </div>
                      </div>
                      {aiAnalysis.recommendation && (
                        <p style={{ fontSize: '12px', color: '#374151', margin: 0, fontStyle: 'italic' }}>"{aiAnalysis.recommendation}"</p>
                      )}
                    </div>
                  )}

                  {/* Send button */}
                  <button
                    onClick={handleSendMatch}
                    disabled={sendingMatch}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '999px', border: 'none',
                      background: 'linear-gradient(145deg, #244c3c, #1b3a2f)',
                      boxShadow: '0px 1px 1px rgba(37,37,39,0.15), inset 0px 1px 2px 2px #386058',
                      color: '#fff', fontSize: '15px', fontWeight: '500', cursor: sendingMatch ? 'not-allowed' : 'pointer',
                      fontFamily: "'Inter Tight', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: sendingMatch ? 0.7 : 1
                    }}
                  >
                    <Send size={15} />
                    {sendingMatch ? 'Sending...' : 'Send Match & Generate Introduction Email'}
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Success */}
                  <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#14532d', margin: '0 0 2px' }}>Match Sent Successfully!</p>
                      <p style={{ fontSize: '12px', color: '#16a34a', margin: 0 }}>Both profiles have been updated to "Match Sent"</p>
                    </div>
                  </div>

                  {/* Email preview */}
                  <div style={{ backgroundColor: '#fdfbf7', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Mail size={14} style={{ color: '#dc9e4a' }} />
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#dc9e4a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>AI-Generated Introduction Email</p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {matchResponse.emailPreview}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px', borderRadius: '999px', border: '1.5px solid #244c3c',
                      backgroundColor: 'transparent', color: '#244c3c', fontSize: '14px',
                      fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter Tight', sans-serif"
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
