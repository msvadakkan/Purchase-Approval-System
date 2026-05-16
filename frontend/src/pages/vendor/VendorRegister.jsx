import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

const SECTION = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="font-semibold text-gray-900 mb-4 text-base">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const INPUT_CLS = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '', vat_number: '', contact_number: '', sales_person: '',
    address: '', email: '', password: '', confirm_password: '',
    bank_name: '', account_name: '', account_number: '', iban: '', swift_code: '', branch: '',
  });
  const [files, setFiles]   = useState({ trade_license: null, vat_certificate: null, bank_document: null });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setFile = k => e => setFiles(f => ({ ...f, [k]: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== 'confirm_password') fd.append(k, v); });
    Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

    try {
      await api.post('/vendors', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Your registration is pending admin approval. You will be notified once approved.</p>
          <Link to="/vendor/login" className="block px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Registration</h1>
          <p className="text-gray-500 text-sm">Register your company to participate in procurement tenders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

          <SECTION title="🏢 Company Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name" required>
                <input value={form.company_name} onChange={set('company_name')} className={INPUT_CLS} placeholder="ABC Trading LLC" required />
              </Field>
              <Field label="VAT Number" required>
                <input value={form.vat_number} onChange={set('vat_number')} className={INPUT_CLS} placeholder="100123456700003" required />
              </Field>
              <Field label="Contact Number" required>
                <input value={form.contact_number} onChange={set('contact_number')} className={INPUT_CLS} placeholder="+971 4 000 0000" required />
              </Field>
              <Field label="Sales Person" required>
                <input value={form.sales_person} onChange={set('sales_person')} className={INPUT_CLS} placeholder="John Smith" required />
              </Field>
            </div>
            <Field label="Address" required>
              <textarea value={form.address} onChange={set('address')} className={INPUT_CLS + ' resize-none'} rows={2} placeholder="P.O. Box 0000, Dubai, UAE" required />
            </Field>
          </SECTION>

          <SECTION title="🔐 Account Credentials">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address" required>
                <input type="email" value={form.email} onChange={set('email')} className={INPUT_CLS} placeholder="vendor@company.com" required />
              </Field>
              <div /> {/* spacer */}
              <Field label="Password" required>
                <input type="password" value={form.password} onChange={set('password')} className={INPUT_CLS} placeholder="••••••••" required minLength={6} />
              </Field>
              <Field label="Confirm Password" required>
                <input type="password" value={form.confirm_password} onChange={set('confirm_password')} className={INPUT_CLS} placeholder="••••••••" required />
              </Field>
            </div>
          </SECTION>

          <SECTION title="🏦 UAE Bank Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bank Name"><input value={form.bank_name} onChange={set('bank_name')} className={INPUT_CLS} placeholder="Emirates NBD" /></Field>
              <Field label="Account Name"><input value={form.account_name} onChange={set('account_name')} className={INPUT_CLS} placeholder="ABC Trading LLC" /></Field>
              <Field label="Account Number"><input value={form.account_number} onChange={set('account_number')} className={INPUT_CLS} placeholder="1012345678901" /></Field>
              <Field label="IBAN"><input value={form.iban} onChange={set('iban')} className={INPUT_CLS} placeholder="AE070331234567890123456" /></Field>
              <Field label="SWIFT / BIC Code"><input value={form.swift_code} onChange={set('swift_code')} className={INPUT_CLS} placeholder="EBILAEAD" /></Field>
              <Field label="Branch"><input value={form.branch} onChange={set('branch')} className={INPUT_CLS} placeholder="Dubai Main Branch" /></Field>
            </div>
          </SECTION>

          <SECTION title="📎 Document Attachments">
            <div className="space-y-3">
              {[
                ['trade_license',    'Trade License', '.pdf,.jpg,.jpeg,.png'],
                ['vat_certificate',  'VAT Certificate', '.pdf,.jpg,.jpeg,.png'],
                ['bank_document',    'Bank Details Document', '.pdf,.jpg,.jpeg,.png'],
              ].map(([key, label, accept]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                  <input type="file" accept={accept} onChange={setFile(key)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" />
                  {files[key] && <p className="text-xs text-teal-600 mt-1">✓ {files[key].name}</p>}
                </div>
              ))}
            </div>
          </SECTION>

          <div className="flex gap-3">
            <Link to="/vendor/login"
              className="flex-1 text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 transition-colors">
              {loading ? 'Submitting…' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
