import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/links";
const SHORT_URL_BASE = import.meta.env.VITE_SHORT_URL_BASE ?? "http://localhost:8080";

const emptyForm = {
  originalUrl: "",
  slug: "",
  title: "",
  notes: "",
};

export default function App() {
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadLinks() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Failed to load links (${res.status})`);

      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return links;

    return links.filter((link) => {
      const haystack = [
        link.slug,
        link.originalUrl,
        link.title || "",
        link.notes || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [links, search]);

  const stats = useMemo(() => {
    const active = links.filter((l) => !l.archived).length;
    const archived = links.filter((l) => l.archived).length;
    const clicks = links.reduce((sum, l) => sum + (l.clickCount || 0), 0);
    return { active, archived, clicks, total: links.length };
  }, [links]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(link) {
    setEditing(link);
    setForm({
      originalUrl: link.originalUrl || "",
      slug: link.slug || "",
      title: link.title || "",
      notes: link.notes || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function submitForm(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const payload = {
        originalUrl: form.originalUrl.trim(),
        slug: form.slug.trim() || null,
        title: form.title.trim() || null,
        notes: form.notes.trim() || null,
      };

      const res = editing
        ? await fetch(`${API_BASE}/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...payload,
              archived: editing.archived,
            }),
          })
        : await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Save failed (${res.status})`);
      }

      await loadLinks();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(link) {
    try {
      setError(null);

      const res = await fetch(`${API_BASE}/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: link.originalUrl,
          title: link.title || null,
          notes: link.notes || null,
          archived: !link.archived,
        }),
      });

      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      await loadLinks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function deleteLink(link) {
    const confirmed = window.confirm(
      `Delete /${link.slug}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setError(null);

      const res = await fetch(`${API_BASE}/${link.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await loadLinks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function copyShortUrl(slug) {
    const shortUrl = `${SHORT_URL_BASE.replace(/\/$/, "")}/${slug}`;
    await navigator.clipboard.writeText(shortUrl);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Personal URL shortener
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Link dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Create, edit, archive, and delete short links.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadLinks}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-100"
            >
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              New link
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total links" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Archived" value={stats.archived} />
          <StatCard label="Total clicks" value={stats.clicks} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Links</h2>
              <p className="text-sm text-slate-500">
                Search, copy, edit, archive, or remove your short links.
              </p>
            </div>
            <div className="w-full lg:max-w-md">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search slug, title, URL, or notes"
                className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-12 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
              <div className="col-span-2">Slug</div>
              <div className="col-span-4">Destination</div>
              <div className="col-span-2">Clicks</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="px-4 py-10 text-sm text-slate-500">Loading links…</div>
            ) : filteredLinks.length === 0 ? (
              <div className="px-4 py-10 text-sm text-slate-500">
                No links found. Create your first one.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredLinks.map((link) => (
                  <div key={link.id} className="grid gap-4 px-4 py-4 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-2">
                      <div className="text-sm font-semibold">/{link.slug}</div>
                      <div className="mt-1 text-xs text-slate-500">{link.title || "Untitled"}</div>
                    </div>

                    <div className="md:col-span-4">
                      <div className="truncate text-sm text-slate-700">{link.originalUrl}</div>
                      {link.notes ? (
                        <div className="mt-1 truncate text-xs text-slate-500">{link.notes}</div>
                      ) : null}
                    </div>

                    <div className="md:col-span-2 text-sm font-medium">{link.clickCount || 0}</div>

                    <div className="md:col-span-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          link.archived
                            ? "bg-slate-200 text-slate-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {link.archived ? "Archived" : "Active"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 md:col-span-2 md:justify-end">
                      <button
                        onClick={() => copyShortUrl(link.slug)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-100"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => openEdit(link)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleArchive(link)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-100"
                      >
                        {link.archived ? "Unarchive" : "Archive"}
                      </button>
                      <button
                        onClick={() => deleteLink(link)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {editing ? "Edit link" : "Create new link"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Save a custom short slug and the full destination URL.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitForm} className="mt-6 grid gap-4">
              <Field
                label="Original URL"
                value={form.originalUrl}
                onChange={(v) => setForm((f) => ({ ...f, originalUrl: v }))}
                placeholder="https://example.com/page"
              />
              <Field
                label="Slug"
                value={form.slug}
                onChange={(v) => setForm((f) => ({ ...f, slug: v }))}
                placeholder="spring-sale"
              />
              <Field
                label="Title"
                value={form.title}
                onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="Optional title"
              />
              <Field
                label="Notes"
                value={form.notes}
                onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                placeholder="Optional notes"
                textarea
              />

              <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : editing ? "Update link" : "Create link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
        />
      )}
    </label>
  );
}
