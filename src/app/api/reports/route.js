// TODO: Implement reports API
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { corsHeaders } from '@/lib/cors';
import { serializeId } from '@/lib/ids';

// GET /api/reports — List all reports
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const db = await getDb();
        const filter = {};

        if (status) {
            filter.status = status;
        }

        const reports = await db.collection('reports')
            .find(filter)
            .sort({ date: -1 })
            .toArray();

        const result = reports.map(({ _id, ...rest }) => ({ id: serializeId(_id), ...rest }));
        return NextResponse.json(result, { headers: corsHeaders() });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders() }
        );
    }
}

// POST /api/reports — Create a new report
export async function POST(request) {
    try {
        const { type, userId, userName, subject, description } = await request.json();

        if (!subject || !description) {
            return NextResponse.json(
                { error: 'Subject and description are required' },
                { status: 400, headers: corsHeaders() }
            );
        }

        const db = await getDb();

        const newReport = {
            type: type || 'general',
            userId: userId || null,
            userName: userName || 'Anonymous',
            subject,
            description,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
        };

        const result = await db.collection('reports').insertOne(newReport);

        return NextResponse.json(
            { id: serializeId(result.insertedId), ...newReport },
            { status: 201, headers: corsHeaders() }
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