import { NextRequest, NextResponse } from 'next/server';
import {
  SYNTHETIC_PATIENTS,
  SYNTHETIC_VISITS,
  SYNTHETIC_REFERRALS
} from '@/lib/constants';
import {
  PatientProfile,
  HomeVisitRecord,
  ReferralTicket,
  SyncQueueItem
} from '@/lib/types';

export const dynamic = 'force-dynamic';

// Server-side shared clinical state store (acts as real-time cloud bridge when Supabase env keys are optional)
interface ServerCareStore {
  patients: PatientProfile[];
  visits: HomeVisitRecord[];
  referrals: ReferralTicket[];
  auditTrail: SyncQueueItem[];
  lastUpdated: string;
}

const globalForCareStore = globalThis as unknown as {
  __sickleCareStore?: ServerCareStore;
};

if (!globalForCareStore.__sickleCareStore) {
  globalForCareStore.__sickleCareStore = {
    patients: structuredClone(SYNTHETIC_PATIENTS),
    visits: structuredClone(SYNTHETIC_VISITS),
    referrals: structuredClone(SYNTHETIC_REFERRALS),
    auditTrail: [
      {
        id: 'SYNC-INIT-1',
        actionType: 'ISSUE_REFERRAL',
        summary: 'ASHA Radha Yadav issued Priority 48h CHC Referral for Arjun Gond (39kg dose review)',
        timestamp: new Date().toISOString(),
        synced: true
      }
    ],
    lastUpdated: new Date().toISOString()
  };
}

export async function GET() {
  const store = globalForCareStore.__sickleCareStore!;
  return NextResponse.json({
    ...store,
    supabaseConnected: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')
    )
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = globalForCareStore.__sickleCareStore!;

    if (Array.isArray(body.patients)) {
      store.patients = body.patients;
    }
    if (Array.isArray(body.visits)) {
      store.visits = body.visits;
    }
    if (Array.isArray(body.referrals)) {
      store.referrals = body.referrals;
    }
    if (body.event) {
      const syncedEvent: SyncQueueItem = {
        ...body.event,
        synced: true
      };
      store.auditTrail = [syncedEvent, ...store.auditTrail.slice(0, 29)];
    }

    store.lastUpdated = new Date().toISOString();

    return NextResponse.json({
      ok: true,
      store,
      syncedAt: store.lastUpdated
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'Failed to sync care loop state' },
      { status: 500 }
    );
  }
}
