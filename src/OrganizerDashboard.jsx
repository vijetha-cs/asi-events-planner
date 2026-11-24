import { useState } from "react";

const EMPTY_EVENT = {
  title: "",
  category: "Community",
  date: "",
  time: "",
  location: "",
  accessibilityNotes: "",
  registrationLimit: "",
};

function loadRegisteredIds() {
  try {
    const ids = JSON.parse(
      localStorage.getItem("beach-life-registered-events") || "[]",
    );
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);

  return {
    dateLabel: date
      .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      .toUpperCase(),
    dateText: date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export default function OrganizerDashboard({
  events = [],
  onBack,
  onSave,
  onDelete,
  onToggleStatus,
}) {
  const [form, setForm] = useState(EMPTY_EVENT);
  const [editingId, setEditingId] = useState(null);
  const [registeredIds] = useState(loadRegisteredIds);

  const publishedCount = events.filter(
    (event) => event.status === "published",
  ).length;
  const draftCount = events.filter((event) => event.status === "draft").length;

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function startEditing(event) {
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      category: event.category || "Community",
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      accessibilityNotes: event.accessibilityNotes || "",
      registrationLimit: event.registrationLimit || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setEditingId(null);
    setForm(EMPTY_EVENT);
  }

  function submitForm(event) {
    event.preventDefault();

    const status = event.nativeEvent.submitter?.value || "published";
    const { dateLabel, dateText } = formatDate(form.date);

    onSave({
      ...form,
      id: editingId,
      dateLabel,
      dateText,
      source: "Organizer demo",
      color: "from-sky-700 to-cyan-500",
      symbol: "✦",
      status,
    });

    clearForm();
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-[#142f43] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25877f]">
              Organizer workspace · Demo
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Manage events
            </h1>
          </div>
          <button
            onClick={onBack}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold hover:border-[#25877f]"
          >
            ← Back to student view
          </button>
        </header>

        <section
          className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Event totals"
        >
          {[
            ["Published", publishedCount],
            ["Drafts", draftCount],
            ["Total events", events.length],
            ["Demo registrations on this browser", registeredIds.length],
          ].map(([label, count]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#e5e1d7] bg-white p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black">{count}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={submitForm}
            className="rounded-3xl border border-[#e5e1d7] bg-white p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">
                {editingId ? "Edit event" : "Create an event"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="text-sm font-semibold text-slate-500 underline"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                Event title
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#25877f] focus:ring-4 focus:ring-[#25877f]/10"
                  placeholder="e.g., Beach cleanup meetup"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-[#25877f]"
                  >
                    <option>Community</option>
                    <option>Sustainability</option>
                    <option>Wellness</option>
                    <option>Creative</option>
                    <option>Workshop</option>
                  </select>
                </label>

                <label className="block text-sm font-semibold">
                  Date
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={updateField}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#25877f]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Time
                  <input
                    name="time"
                    value={form.time}
                    onChange={updateField}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#25877f]"
                    placeholder="e.g., 2:00 PM – 4:00 PM"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#25877f]"
                    placeholder="Building or campus area"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Accessibility notes
                <textarea
                  name="accessibilityNotes"
                  value={form.accessibilityNotes}
                  onChange={updateField}
                  rows="3"
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#25877f]"
                  placeholder="Entrance, elevator, seating, or accommodation details"
                />
              </label>

              <label className="block text-sm font-semibold">
                Registration limit
                <input
                  name="registrationLimit"
                  type="number"
                  min="1"
                  value={form.registrationLimit}
                  onChange={updateField}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#25877f]"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                name="status"
                value="draft"
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
              >
                Save draft
              </button>
              <button
                type="submit"
                name="status"
                value="published"
                className="rounded-xl bg-[#142f43] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#25877f]"
              >
                {editingId ? "Update event" : "Publish event"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-[#e5e1d7] bg-white p-6">
            <h2 className="mb-5 text-xl font-extrabold">Your events</h2>

            {events.length === 0 ? (
              <p className="rounded-2xl bg-[#f7f5ef] p-5 text-sm text-slate-600">
                No organizer events yet. Create one using the form.
              </p>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => {
                  const registrationCount = registeredIds.filter(
                    (id) => id === event.id,
                  ).length;

                  return (
                    <li
                      key={event.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{event.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {event.dateText} · {event.location}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {registrationCount} demo sign-up
                            {registrationCount === 1 ? "" : "s"} on this browser
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            event.status === "published"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {event.status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditing(event)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onToggleStatus(event.id)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50"
                        >
                          {event.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                        <button
                          onClick={() => onDelete(event.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </section>

        <p className="mt-6 text-xs text-slate-500">
          Demo organizer screen. Registration counts are stored in this browser
          only.
        </p>
      </div>
    </main>
  );
}
