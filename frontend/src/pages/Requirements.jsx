import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_COLORS = {
  open:   'bg-green-100 text-green-700',
  closed: 'bg-gray-100  text-gray-600',
};

export default function Requirements() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tenders : tenders.filter(t => t.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requirements / Tenders</h2>
          <p className="text-gray-500 text-sm">Procurement requirements open for vendor bidding</p>
        </div>
        <Link
          to="/requirements/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + New Requirement
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'open', 'closed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>No requirements found. <Link to="/requirements/new" className="text-indigo-600 underline">Create one</Link>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Link key={t.id} to={`/requirements/${t.id}`} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all block">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {t.status}
                </span>
                <span className="text-xs text-gray-400">{t.quote_count ?? 0} quote{t.quote_count !== 1 ? 's' : ''}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{t.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{t.category || 'General'} · {t.department || '—'}</span>
                {t.deadline && <span>Due {new Date(t.deadline).toLocaleDateString()}</span>}
              </div>
              {t.budget && (
                <p className="text-xs text-indigo-600 font-medium mt-2">Budget: ${Number(t.budget).toLocaleString()}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
