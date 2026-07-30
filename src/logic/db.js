/**
 * db.js – Custom lightweight Supabase PostgREST client
 *
 * Uses fetch() to query the profiles table.
 * Requires a valid auth token for authenticated requests.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

const REST_URL = `${SUPABASE_URL}/rest/v1`;

/** Build headers with optional auth token */
function headers(token) {
  const h = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

/** Get token from localStorage */
function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('emerald-wiki-auth');
    if (!raw) return null;
    return JSON.parse(raw).access_token || null;
  } catch {
    return null;
  }
}

/**
 * Query rows from a table.
 * @param {string} table - Table name
 * @param {{ select?: string, eq?: [string, any], order?: string }} filters
 * @returns {Promise<Array>}
 */
export async function query(table, filters = {}) {
  const token = getToken();
  let url = `${REST_URL}/${table}?select=*`;

  if (filters.select) url = `${REST_URL}/${table}?select=${filters.select}`;

  if (filters.eq) {
    const [col, val] = filters.eq;
    url += `&${col}=eq.${encodeURIComponent(val)}`;
  }

  if (filters.order) {
    url += `&order=${filters.order}`;
  }

  const res = await fetch(url, { headers: headers(token) });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB query failed: ${err}`);
  }

  return res.json();
}

/** Get a single row by column value. */
export async function getRow(table, column, value) {
  const rows = await query(table, { eq: [column, value] });
  return rows[0] || null;
}

/** Get current user's profile (by auth.uid()). */
export async function getMyProfile() {
  const token = getToken();
  if (!token) return null;

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) return null;
  const user = await userRes.json();

  return getRow('profiles', 'id', user.id);
}

/** Insert a row into a table. */
export async function insertRow(table, data) {
  const token = getToken();
  const res = await fetch(`${REST_URL}/${table}`, {
    method: 'POST',
    headers: { ...headers(token), Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert failed: ${err}`);
  }

  const rows = await res.json();
  return rows[0];
}

/** Update rows in a table. */
export async function updateRow(table, data, match) {
  const token = getToken();
  const [col, val] = match;

  const res = await fetch(
    `${REST_URL}/${table}?${col}=eq.${encodeURIComponent(val)}`,
    {
      method: 'PATCH',
      headers: { ...headers(token), Prefer: 'return=representation' },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update failed: ${err}`);
  }

  const rows = await res.json();
  return rows[0] || null;
}

/** Delete rows from a table. */
export async function deleteRow(table, match) {
  const token = getToken();
  const [col, val] = match;

  const res = await fetch(
    `${REST_URL}/${table}?${col}=eq.${encodeURIComponent(val)}`,
    { method: 'DELETE', headers: headers(token) }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete failed: ${err}`);
  }

  return true;
}

/** Fetch ALL profiles (admin only — RLS enforced). */
export async function getAllProfiles() {
  return query('profiles', { order: 'created_at.desc' });
}

/** Update a profile's role (admin only). */
export async function updateProfileRole(profileId, role) {
  return updateRow('profiles', { role }, ['id', profileId]);
}

/** Delete a profile (admin only). */
export async function deleteProfile(profileId) {
  return deleteRow('profiles', ['id', profileId]);
}
