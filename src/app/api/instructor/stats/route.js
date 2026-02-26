// TODO: Implement instructor stats API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';
import { coerceNumberId } from '@/lib/ids';

// GET /api/instructor/stats?instructorId=X
// Returns real completion rate, response rate, and total students for an instructor
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const instructorId = searchParams.get('instructorId');

        if (!instructorId) {
            return NextResponse.json(
                { error: 'instructorId is required' },
                { status: 400, headers: corsHeaders() }
            );
        }

        const db = await getDb();

        // All courses taught by this instructor
        const courses = await db.collection('courses').find({ instructorId }).toArray();

        if (courses.length === 0) {
            return NextResponse.json(
                { totalStudents: 0, completionRate: 0, responseRate: 0 },
                { headers: corsHeaders() }
            );
        }

        const courseIds = courses.map((c) => c._id);

        // Total enrolled students across all instructor courses (real count)
        const totalStudents = await db.collection('users').countDocuments({
            enrolledCourses: { $in: courseIds },
            role: 'student',
        });

        // Completion rate: avg lesson completion % across all enrollments
        // Find all students enrolled in any of these courses
        const students = await db.collection('users').find({
            enrolledCourses: { $in: courseIds },
        }).toArray();

        let totalLessonsCompleted = 0;
        let totalLessonsPossible = 0;

        for (const student of students) {
            const enrolledIds = (student.enrolledCourses || []).map(coerceNumberId);
            for (const course of courses) {
                if (!enrolledIds.includes(course._id)) continue;
                const lessons = course.lessons || [];
                if (lessons.length === 0) continue;
                const done = lessons.filter((l) =>
                    (student.completedLessons || []).includes(l.id)
                ).length;
                totalLessonsCompleted += done;
                totalLessonsPossible += lessons.length;
            }
        }

        const completionRate =
            totalLessonsPossible > 0
                ? Math.round((totalLessonsCompleted / totalLessonsPossible) * 100)
                : 0;

        // Response rate: % of questions in instructor's courses that are answered
        const totalQ = await db.collection('questions').countDocuments({
            courseId: { $in: courseIds },
        });
        const answeredQ = await db.collection('questions').countDocuments({
            courseId: { $in: courseIds },
            status: 'answered',
        });
        const responseRate = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

        return NextResponse.json(
            { totalStudents, completionRate, responseRate },
            { headers: corsHeaders() }
        );
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