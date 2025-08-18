import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getTasks } from '@/lib/mockdb';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';
if (publicKey && privateKey) {
  webpush.setVapidDetails('mailto:example@example.com', publicKey, privateKey);
}

const subs: any[] = [];

export async function POST(req: Request) {
  const sub = await req.json();
  subs.push(sub);

  // schedule notifications for due tasks
  const tasks = getTasks(7);
  tasks.forEach((t) => {
    const timeout = new Date(t.dueAt).getTime() - Date.now();
    if (timeout > 0) {
      setTimeout(() => {
        subs.forEach((s) => {
          webpush
            .sendNotification(
              s,
              JSON.stringify({
                title: 'Task Due',
                body: `${t.plantName}: ${t.type}`,
              })
            )
            .catch(() => {});
        });
      }, timeout);
    }
  });

  return NextResponse.json({ ok: true });
}
