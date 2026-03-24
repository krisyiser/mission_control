import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
  const USERNAME = process.env.GITHUB_USERNAME || 'krisyiser';

  try {
    // 1. Fetch GitHub Repos
    const ghRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const repos = await ghRes.json();
    if (!Array.isArray(repos)) throw new Error('Failed to fetch GitHub repos');

    // 2. Fetch Netlify Sites
    const nfRes = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
    });
    const sites = await nfRes.json();
    if (!Array.isArray(sites)) throw new Error('Failed to fetch Netlify sites');

    // 3. Process and Upsert
    const projectUpserts = repos.map((repo: any) => {
      const site = sites.find((s: any) => s.build_settings && s.build_settings.repo_path === `${USERNAME}/${repo.name}`);
      return {
        name: repo.name,
        github_url: repo.html_url,
        netlify_url: site ? site.ssl_url : null,
        status: site ? (site.build_settings ? 'online' : 'offline') : 'online'
      };
    });

    const { error } = await supabase.from('projects').upsert(projectUpserts, { onConflict: 'github_url' });
    if (error) throw error;

    return NextResponse.json({ success: true, count: projectUpserts.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
