const styles = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-green-100  text-green-800',
  rejected:  'bg-red-100    text-red-800',
  cancelled: 'bg-gray-100   text-gray-600',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
