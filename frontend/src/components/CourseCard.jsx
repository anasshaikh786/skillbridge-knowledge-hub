import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";

export default function CourseCard({ course, testId }) {
  return (
    <Link
      to={`/course/${course.id}`}
      className="group bg-[#121214] border border-zinc-800/60 hover:border-zinc-700 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 block"
      data-testid={testId || `course-card-${course.id}`}
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        <img src={course.thumbnail} alt={course.courseName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-xs px-3 py-1 rounded-full text-white border border-white/10">
          {course.category?.name || "Course"}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-white leading-tight line-clamp-2 group-hover:text-[#FFD60A] transition-colors">
          {course.courseName}
        </h3>
        <p className="text-xs text-zinc-500 mt-2">
          By {course.instructor?.firstName} {course.instructor?.lastName}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-[#FFD60A] fill-[#FFD60A]" />
            {course.avgRating || "New"} {course.ratingCount ? `(${course.ratingCount})` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.studentsEnrolled || 0}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/60">
          <div className="text-lg font-bold text-white">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </div>
          <span className="text-xs text-[#FFD60A] font-semibold group-hover:translate-x-1 transition-transform">View →</span>
        </div>
      </div>
    </Link>
  );
}
