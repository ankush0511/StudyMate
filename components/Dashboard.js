// components/Dashboard.js
import Widget from './Widget';
import LearningProgress from './LearningProgress';
import RecommendedCourses from './RecommendedCourses';
import LearningPath from './LearningPath';

export default function Dashboard() {
  return (
    <main className="w-4/5 flex-1 p-8 mt-16 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <section className="grid grid-cols-3 gap-6 mb-8">
        <Widget title="Current Streak" value="7" subtitle="Keep it up!" />
        <Widget title="Longest Streak" value="15" subtitle="8 days to beat" />
        <Widget title="Total Days" value="42" subtitle="Learning journey" />
      </section>
      <section className="grid grid-cols-3 gap-6">
        <LearningProgress />
        <RecommendedCourses />
        <LearningPath />
      </section>
    </main>
  );
}
