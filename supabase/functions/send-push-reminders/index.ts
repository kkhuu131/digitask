/* global Deno */
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const cronSecret = Deno.env.get('REMINDER_CRON_SECRET')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'https://digitask-pi.vercel.app';
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const localParts = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
};

const currentWeekStart = (localDate: string) => {
  const date = new Date(`${localDate}T12:00:00Z`);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return date.toISOString().slice(0, 10);
};

const buildMessage = (
  quotaRemaining: number,
  scheduledCount: number,
  tournamentAvailable: boolean
) => {
  const sentences: string[] = [];
  if (quotaRemaining > 0) {
    sentences.push(
      `Don't lose your streak! Complete ${quotaRemaining} more task${quotaRemaining === 1 ? '' : 's'}.`
    );
  }
  if (scheduledCount > 0) {
    sentences.push(`${scheduledCount} scheduled task${scheduledCount === 1 ? '' : 's'} pending.`);
  }
  if (tournamentAvailable) sentences.push('Your weekly tournament entry is still available.');
  return sentences.length > 0 ? sentences.join(' ') : null;
};

Deno.serve(async (request) => {
  if (!cronSecret || request.headers.get('x-cron-secret') !== cronSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!vapidPublicKey || !vapidPrivateKey) {
    return Response.json({ error: 'Web Push is not configured' }, { status: 503 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const now = new Date();
  const { data: preferences, error } = await supabase
    .from('notification_preferences')
    .select(
      'user_id,daily_quota,scheduled_tasks,tournaments,reminder_time,timezone,last_sent_local_date'
    )
    .eq('enabled', true);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sentUsers = 0;
  for (const preference of preferences ?? []) {
    let local;
    try {
      local = localParts(now, preference.timezone);
    } catch {
      continue;
    }
    const [hour, minute] = preference.reminder_time.split(':').map(Number);
    const reminderMinutes = hour * 60 + minute;
    if (local.minutes < reminderMinutes || local.minutes >= reminderMinutes + 15) continue;
    if (preference.last_sent_local_date === local.date) continue;

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const [quotaResult, taskResult, tournamentResult, subscriptionResult] = await Promise.all([
      preference.daily_quota
        ? supabase
            .from('daily_quotas')
            .select('completed_today')
            .eq('user_id', preference.user_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      preference.scheduled_tasks
        ? supabase
            .from('tasks')
            .select('is_daily,due_date,recurring_days')
            .eq('user_id', preference.user_id)
            .eq('is_completed', false)
        : Promise.resolve({ data: [], error: null }),
      preference.tournaments
        ? supabase
            .from('user_tournaments')
            .select('id')
            .eq('user_id', preference.user_id)
            .eq('week_start', currentWeekStart(local.date))
            .maybeSingle()
        : Promise.resolve({ data: { id: 'disabled' }, error: null }),
      supabase
        .from('push_subscriptions')
        .select('id,endpoint,p256dh,auth')
        .eq('user_id', preference.user_id),
    ]);
    if (quotaResult.error || taskResult.error || tournamentResult.error || subscriptionResult.error)
      continue;

    const quotaRemaining = preference.daily_quota
      ? Math.max(0, 3 - (quotaResult.data?.completed_today ?? 0))
      : 0;
    const localWeekday = new Date(`${local.date}T12:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    });
    const scheduledCount = (taskResult.data ?? []).filter((task) => {
      if (task.is_daily) return true;
      if (task.recurring_days?.includes(localWeekday)) return true;
      return Boolean(task.due_date && task.due_date <= tomorrow);
    }).length;
    const body = buildMessage(
      quotaRemaining,
      scheduledCount,
      preference.tournaments && !tournamentResult.data
    );
    if (!body || !subscriptionResult.data?.length) continue;

    let delivered = false;
    for (const subscription of subscriptionResult.data) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({ title: 'Digitask Reminder', body, url: '/' })
        );
        delivered = true;
      } catch (pushError) {
        const statusCode = (pushError as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', subscription.id);
        }
      }
    }

    if (delivered) {
      await supabase
        .from('notification_preferences')
        .update({ last_sent_local_date: local.date, updated_at: now.toISOString() })
        .eq('user_id', preference.user_id);
      sentUsers += 1;
    }
  }

  return Response.json({ sentUsers });
});
