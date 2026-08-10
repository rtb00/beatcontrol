import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';
import { isUnlocked } from '@/app/lib/visibility';

// Statistik ohne Titel für die Paar-Seite: nur der eingeloggte Besitzer der
// Feier darf sie abrufen, sonst würden Fremde Aktivität eines Events ausspähen.
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initDB();

  const { rows: eventRows } = await sql`
    SELECT
      e.id, e.dj_id, e.credit_redeemed, e.unlocked_at,
      u.plan AS owner_plan,
      u.plan_status AS owner_plan_status,
      u.current_period_end AS owner_current_period_end
    FROM events e
    LEFT JOIN users u ON u.id = e.dj_id
    WHERE e.slug = ${params.slug}
  `;
  if (eventRows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const evt = eventRows[0];
  if (evt.dj_id !== session.user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const unlocked = isUnlocked(
    evt.owner_plan
      ? {
          plan: evt.owner_plan,
          plan_status: evt.owner_plan_status,
          current_period_end: evt.owner_current_period_end,
        }
      : null,
    evt.credit_redeemed === true,
    evt.unlocked_at
  );

  const { rows } = await sql`
    SELECT
      COUNT(DISTINCT s.id)::int AS total,
      COUNT(v.id)::int AS votes_total,
      COUNT(DISTINCT s.submitter_ip)::int AS contributors,
      MAX(s.created_at) AS last_wish_at,
      COALESCE(MAX(sub.vote_count), 0)::int AS top_votes
    FROM songs s
    LEFT JOIN votes v ON v.song_id = s.id
    LEFT JOIN (
      SELECT song_id, COUNT(*)::int AS vote_count FROM votes GROUP BY song_id
    ) sub ON sub.song_id = s.id
    WHERE s.event_id = ${evt.id}
  `;
  const row = rows[0];

  return NextResponse.json({
    total: row.total,
    votes_total: row.votes_total,
    contributors: row.contributors,
    last_wish_at: row.last_wish_at,
    top_votes: row.top_votes,
    unlocked,
  });
}
