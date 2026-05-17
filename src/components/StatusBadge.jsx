const STYLES = {
  pending:   'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  approved:  'bg-green-100  text-green-700  ring-1 ring-green-200',
  rejected:  'bg-red-100    text-red-700    ring-1 ring-red-200',
  cancelled: 'bg-gray-100   text-gray-600   ring-1 ring-gray-200',
  draft:     'bg-gray-100   text-gray-600   ring-1 ring-gray-200',
  sent:      'bg-blue-100   text-blue-700   ring-1 ring-blue-200',
  acknowledged: 'bg-teal-100 text-teal-700  ring-1 ring-teal-200',
  open:      'bg-blue-50    text-blue-700   ring-1 ring-blue-200',
  closed:    'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
