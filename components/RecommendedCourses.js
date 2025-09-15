export default function RecommendedCourses() {
  const courses = [
    { name: "Advanced JavaScript", lessons: 15 },
    { name: "AI Fundamentals", lessons: 12 }
  ];
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-lg font-semibold mb-2">Recommended Courses</div>
      <ul>
        {courses.map(c => (
          <li key={c.name} className="mb-2">
            <span className="font-bold">{c.name}</span> – {c.lessons} lessons
          </li>
        ))}
      </ul>
    </div>
  );
}
