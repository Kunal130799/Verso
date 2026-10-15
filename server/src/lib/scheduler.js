import { supabase } from './supabase.js'

// Publishes drafts whose scheduled_at has passed. Runs every minute while
// the server is awake, and on every /health ping — the uptime pinger that
// keeps Render awake therefore also keeps scheduled posts on time.
// Errors are swallowed (e.g. before the scheduling migration has been run).
export async function publishDuePosts() {
  const { data: due, error } = await supabase
    .from('posts')
    .select('id, scheduled_at')
    .eq('status', 'draft')
    .lte('scheduled_at', new Date().toISOString())
  if (error || !due?.length) return 0

  for (const post of due) {
    await supabase
      .from('posts')
      .update({ status: 'public', published_at: post.scheduled_at, scheduled_at: null })
      .eq('id', post.id)
      .eq('status', 'draft') // don't clobber a post the author changed meanwhile
  }
  return due.length
}

export function startScheduler(intervalMs = 60 * 1000) {
  const run = () => publishDuePosts().catch(() => {})
  run()
  return setInterval(run, intervalMs)
}
