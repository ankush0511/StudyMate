// components/Widget.js
export default function Widget({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-700">{title}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  );
}
