// TODO: Implement categories API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';

// GET /api/categories — List all categories
export async function GET() {
    try {
        const db = await getDb();
        const categories = await db.collection('categories').find({}).toArray();

        const result = categories.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
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