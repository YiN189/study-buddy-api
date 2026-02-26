// TODO: Implement instructor students API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';
import { serializeId } from '@/lib/ids';

// GET /api/instructor/students?instructorId=X
// Returns all students enrolled in any of the instructor's courses,
// with the list of courses each student is enrolled in.
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

        // Get all courses by this instructor
        const courses = await db.collection('courses')
            .find({ instructorId })
            .toArray();

        if (courses.length === 0) {
            return NextResponse.json([], { headers: corsHeaders() });
        }

        const courseIds = courses.map((c) => c._id);

        // Build a map of courseId -> course title for fast lookup
        const courseMap = {};
        for (const c of courses) {
            courseMap[c._id] = { id: c._id, title: c.title, category: c.category };
        }

        // Find all students enrolled in any of these courses
        const students = await db.collection('users')
            .find({
                role: 'student',
                enrolledCourses: { $in: courseIds },
            })
            .toArray();

        // For each student, list only the instructor's courses they're enrolled in
        const result = students.map(({ _id, password: _, ...rest }) => {
            const enrolledInMyCourses = (rest.enrolledCourses || [])
                .filter((id) => courseIds.includes(id))
                .map((id) => courseMap[id])
                .filter(Boolean);

            return {
                id: serializeId(_id),
                name: rest.name,
                email: rest.email,
                enrolledCourses: enrolledInMyCourses,
                completedLessons: (rest.completedLessons || []).length,
                joinedAt: rest.createdAt || null,
            };
        });

        return NextResponse.json(result, { headers: corsHeaders() });
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