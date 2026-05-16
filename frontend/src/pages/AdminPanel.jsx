import { useState, useEffect } from 'react';
import api from '../api';

const ROLES = [
  { value: 'admin',           label: 'Administrator',    icon: '🛡️' },
  { value: 'ceo',             label: 'CEO',              icon: '👑' },
  { value: 'department_head', label: 'Department Head',  icon: '🏛️' },
  { value: 'manager',         label: 'Manager',          icon: '👤' },
  { value: 'employee',        label: 'Employee',         icon: '👷' },
];

const ROLE_COLORS = {
  admin:           'bg-purple-100 text-purple-700',
  ceo:             'bg-yellow-100 text-yellow-700',
  department_head: 'bg-blue-100   text-blue-700',
  manager:         'bg-green-100  text-green-700',
  employee:        'bg-gray-100   text-gray-700',
};

export default function AdminPanel() {
  const [tab, setTab] = useState('levels');
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-gray-500 text-sm">Manage users and configure approval thresholds</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {[['levels', '⚙️ Approval Levels'], ['users', '👥 Users']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'levels' ? <ApprovalLevels /> : <UsersTab />}
    </div>
  );
}

function ApprovalLevels() {
  const [levels, setLevels]   = useState([]);
  const [amounts, setAmounts] = useState({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    api.get('/admin/approval-levels').then(({ data }) => {
      setLevels(data);
      const m = {};
      data.forEach(l => { m[l.role] = l.max_amount; });
      setAmounts(m);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/approval-levels', {
        levels: levels
          .filter(l => l.role !== 'ceo')
          .map(l => ({ role: l.role, max_amount: parseFloat(amounts[l.role]) || l.max_amount })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Approval Thresholds</h3>
          <p className="text-gray-500 text-sm mt-1">
            Purchase requests are automatically routed to the <strong>lowest role</strong> whose threshold covers the requested amount. The CEO approves anything above the Department Head limit.
          </p>
        </div>

        <div className="p-6 space-y-3">
          {levels.map((level, i) => {
            const isCEO = level.role === 'ceo';
            return (
              <div key={level.role} className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{ROLES.find(r => r.value === level.role)?.icon ?? '👤'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{level.label}</p>
                    {!isCEO && i < levels.length - 1 && (
                      <p className="text-xs text-gray-400">Escalates if amount exceeds threshold</p>
                    )}
                    {isCEO && <p className="text-xs text-gray-400">Approves all amounts above Dept Head limit</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 font-medium">Max:</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={isCEO ? '' : (amounts[level.role] ?? '')}
                      onChange={e => setAmounts(a => ({ ...a, [level.role]: e.target.value }))}
                      disabled={isCEO}
                      min="0"
                      className="border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      placeholder={isCEO ? 'Unlimited' : ''}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: '', email: '', password: '', role: 'employee', department: '', is_active: 1 };

function UsersTab() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const load = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit   = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department ?? '', is_active: u.is_active });
    setError('');
    setModal(u);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal === 'create') {
        await api.post('/users', form);
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${modal.id}`, payload);
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try { await api.delete(`/users/${u.id}`); await load(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Users ({users.length})</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Add User
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                        {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.department || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="px-3 py-1 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">Edit</button>
                        <button onClick={() => handleDelete(u)} className="px-3 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {modal === 'create' ? 'Add New User' : `Edit — ${modal.name}`}
            </h3>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input value={form.name} onChange={set('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="jane@company.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Password {modal !== 'create' && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                  {modal === 'create' && ' *'}
                </label>
                <input type="password" value={form.password} onChange={set('password')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label>
                  <select value={form.role} onChange={set('role')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                  <input value={form.department} onChange={set('department')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Finance" />
                </div>
              </div>

              {modal !== 'create' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">Account is active</span>
                </label>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                {saving ? 'Saving…' : 'Save User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
