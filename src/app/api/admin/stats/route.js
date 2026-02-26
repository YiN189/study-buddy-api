// TODO: Implement admin stats API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';

// GET /api/admin/stats — Get real system-wide statistics (always computed from DB)
export async function GET() {
    try {
        const db = await getDb();

        // Real user counts
        const totalUsers = await db.collection('users').countDocuments();
        const totalCourses = await db.collection('courses').countDocuments();

        // Only count students for enrollment stats
        const students = await db.collection('users')
            .find({ role: 'student' })
            .toArray();

        const totalEnrollments = students.reduce(
            (acc, s) => acc + (s.enrolledCourses?.length || 0), 0
        );

        // Active users: students with at least one enrolled course or completed lesson
        const activeUsers = students.filter(
            (u) => (u.enrolledCourses?.length || 0) > 0 || (u.completedLessons?.length || 0) > 0
        ).length;

        // Revenue: price × real enrollment count per course
        const courses = await db.collection('courses').find().toArray();
        const courseIds = courses.map((c) => c._id);

        // Count real enrollments per course from users collection
        let revenue = 0;
        for (const course of courses) {
            const enrolledCount = await db.collection('users').countDocuments({
                enrolledCourses: course._id,
                role: 'student',
            });
            revenue += (parseFloat(course.price) || 0) * enrolledCount;
        }

        // Completion rate: % of student–course pairs where all lessons are completed
        let completedEnrollments = 0;
        for (const student of students) {
            for (const courseId of (student.enrolledCourses || [])) {
                const course = courses.find((c) => c._id == courseId);
                if (!course) continue;
                const lessons = course.lessons || [];
                if (lessons.length === 0) continue;
                const allDone = lessons.every((l) =>
                    (student.completedLessons || []).includes(l.id)
                );
                if (allDone) completedEnrollments++;
            }
        }
        const completionRate = totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0;

        const stats = {
            totalUsers,
            totalCourses,
            totalEnrollments,
            activeUsers,
            revenue: Math.round(revenue),
            completionRate,
        };

        return NextResponse.json(stats, { headers: corsHeaders() });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders() }
        );
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders() });
}
