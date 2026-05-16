import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function VendorTenders() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false));
  }, []);

  const filtered = tenders.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Open Tenders</h2>
        <p className="text-gray-500 text-sm">Browse procurement requirements and submit your quotes</p>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-5"
        placeholder="Search tenders…" />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p><p>No tenders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Link key={t.id} to={`/vendor/tenders/${t.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-sm transition-all block">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Open</span>
                {t.deadline && <span className="text-xs text-red-500 font-medium">Due {new Date(t.deadline).toLocaleDateString()}</span>}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{t.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{t.category || 'General'}</span>
                {t.budget && <span className="text-teal-600 font-medium">Budget: AED {Number(t.budget).toLocaleString()}</span>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                <span className="text-teal-600 text-sm font-semibold">Submit Quote →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
