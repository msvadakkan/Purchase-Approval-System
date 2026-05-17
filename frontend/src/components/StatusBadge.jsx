const styles = {
  pending:   { dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200' },
  approved:  { dot: 'bg-green-400',  badge: 'bg-green-50  text-green-800  ring-1 ring-green-200'  },
  rejected:  { dot: 'bg-red-400',    badge: 'bg-red-50    text-red-800    ring-1 ring-red-200'    },
  cancelled: { dot: 'bg-gray-400',   badge: 'bg-gray-50   text-gray-600   ring-1 ring-gray-200'   },
  open:      { dot: 'bg-blue-400',   badge: 'bg-blue-50   text-blue-800   ring-1 ring-blue-200'   },
  closed:    { dot: 'bg-gray-400',   badge: 'bg-gray-50   text-gray-600   ring-1 ring-gray-200'   },
};

export default function StatusBadge({ status }) {
  const s = styles[status] ?? { dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
