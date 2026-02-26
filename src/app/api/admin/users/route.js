// TODO: Implement admin users API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';
import { coerceUserId, serializeId } from '@/lib/ids';

// GET /api/admin/users — List all users grouped by role
export async function GET() {
    try {
        const db = await getDb();

        const allUsers = await db.collection('users').find({}).toArray();

        // Group by role
        const students = allUsers
            .filter((u) => u.role === 'student')
            .map(({ _id, password, ...rest }) => ({ ...rest, id: serializeId(_id) }));
        const instructors = allUsers
            .filter((u) => u.role === 'instructor')
            .map(({ _id, password, ...rest }) => ({ ...rest, id: serializeId(_id) }));
        const admins = allUsers
            .filter((u) => u.role === 'admin')
            .map(({ _id, password, ...rest }) => ({ ...rest, id: serializeId(_id) }));

        return NextResponse.json(
            { students, instructors, admins },
            { headers: corsHeaders() }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders() }
        );
    }
}

// DELETE /api/admin/users?userId=X — Delete a user
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400, headers: corsHeaders() }
            );
        }

        const db = await getDb();
        const result = await db.collection('users').deleteOne({ _id: coerceUserId(userId) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            { message: 'User deleted successfully' },
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