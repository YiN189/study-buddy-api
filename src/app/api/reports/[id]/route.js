// TODO: Implement report status update API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';
import { coerceNumberOrObjectId } from '@/lib/ids';

// PUT /api/reports/[id] — Update report status
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const reportId = coerceNumberOrObjectId(id);
        const { status } = await request.json();

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400, headers: corsHeaders() }
            );
        }

        const db = await getDb();

        const result = await db.collection('reports').updateOne(
            { _id: reportId },
            { $set: { status, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            { message: 'Report updated', status },
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