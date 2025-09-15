export default function LearningPath() {
  const paths = [
    { name: "Full-Stack Development", percent: 75 },
    { name: "Machine Learning Engineer", percent: 30 }
  ];
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-lg font-semibold mb-2">Learning Paths</div>
      <ul>
        {paths.map(p => (
          <li key={p.name} className="mb-4">
            <div className="flex justify-between mb-1">
              <span>{p.name}</span>
              <span>{p.percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${p.percent}%` }}></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
