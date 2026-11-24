import { useEffect, useMemo, useState } from "react";
import OrganizerDashboard from "./OrganizerDashboard";

const ASI_EVENTS_URL =
  "https://www.asicsulb.org/corporate/discover/sustain-u/upcoming-workshops";

const MARKET_PHOTO =
  "https://images.unsplash.com/photo-1695842522132-94067e09ef9e?auto=format&fit=crop&fm=jpg&q=80&w=1200";
const GARDEN_PHOTO =
  "https://images.unsplash.com/photo-1781785273371-a959f34bfab0?auto=format&fit=crop&fm=jpg&q=80&w=1200";
const HUMMINGBIRD_PHOTO =
  "https://images.unsplash.com/photo-1662687999698-d2b783de02ec?auto=format&fit=crop&fm=jpg&q=80&w=1200";

const EVENTS = [
  {
    id: "trash-talkers-nov30",
    title: "Trash Talkers Tabling",
    category: "Sustainability",
    dateLabel: "NOV 30",
    dateText: "Monday, November 30, 2026",
    time: "11:00 AM – 12:00 PM",
    location: "Speaker's Platform West",
    source: "ASI listing",
    officialUrl: ASI_EVENTS_URL,
    color: "from-emerald-700 to-teal-500",
    symbol: "✳",
    imageUrl: GARDEN_PHOTO,
    imageAlt:
      "Illustrative stock photo of people working in a community garden",
    photoCredit: "Haberdoedas",
    photoCreditUrl:
      "https://unsplash.com/photos/people-working-and-gathering-in-a-community-garden-with-greenhouses-UAVXHBmVDOQ",
  },
  {
    id: "farmers-market",
    title: "Farmers Market Tabling",
    category: "Sustainability",
    dateLabel: "DEC 01",
    dateText: "Tuesday, December 1, 2026",
    time: "11:00 AM – 2:00 PM",
    location: "Friendship Walkway",
    source: "ASI listing",
    officialUrl: ASI_EVENTS_URL,
    color: "from-amber-500 to-orange-400",
    symbol: "✿",
    imageUrl: MARKET_PHOTO,
    imageAlt: "Illustrative stock photo of fresh produce at a farmers market",
    photoCredit: "Alexane Desbiens",
    photoCreditUrl:
      "https://unsplash.com/photos/a-farmers-market-filled-with-lots-of-fresh-produce--ti34q1orbc",
  },
  {
    id: "outreach-session-1",
    title: "Outreach Meeting Session 1",
    category: "Sustainability",
    dateLabel: "DEC 02",
    dateText: "Wednesday, December 2, 2026",
    time: "10:00 AM – 11:00 AM",
    location: "Grow Beach Garden",
    source: "ASI listing",
    officialUrl: ASI_EVENTS_URL,
    color: "from-indigo-700 to-violet-500",
    symbol: "☀",
    imageUrl: GARDEN_PHOTO,
    imageAlt:
      "Illustrative stock photo of people working in a community garden",
    photoCredit: "Haberdoedas",
    photoCreditUrl:
      "https://unsplash.com/photos/people-working-and-gathering-in-a-community-garden-with-greenhouses-UAVXHBmVDOQ",
  },
  {
    id: "outreach-session-2",
    title: "Outreach Meeting Session 2",
    category: "Sustainability",
    dateLabel: "DEC 02",
    dateText: "Wednesday, December 2, 2026",
    time: "2:00 PM – 3:00 PM",
    location: "Grow Beach Garden",
    source: "ASI listing",
    officialUrl: ASI_EVENTS_URL,
    color: "from-sky-700 to-cyan-500",
    symbol: "✦",
    imageUrl: GARDEN_PHOTO,
    imageAlt:
      "Illustrative stock photo of people working in a community garden",
    photoCredit: "Haberdoedas",
    photoCreditUrl:
      "https://unsplash.com/photos/people-working-and-gathering-in-a-community-garden-with-greenhouses-UAVXHBmVDOQ",
  },
  {
    id: "farmers-market-dec8",
    title: "Farmers Market Tabling",
    category: "Sustainability",
    dateLabel: "DEC 08",
    dateText: "Tuesday, December 8, 2026",
    time: "11:00 AM – 2:00 PM",
    location: "Friendship Walkway",
    source: "ASI listing",
    officialUrl: ASI_EVENTS_URL,
    color: "from-rose-600 to-pink-400",
    symbol: "✿",
    imageUrl: MARKET_PHOTO,
    imageAlt: "Illustrative stock photo of fresh produce at a farmers market",
    photoCredit: "Alexane Desbiens",
    photoCreditUrl:
      "https://unsplash.com/photos/a-farmers-market-filled-with-lots-of-fresh-produce--ti34q1orbc",
  },
  {
    id: "huts-for-hummers",
    title: "Collaboration #4: Huts for Hummers with BPE",
    category: "Sustainability",
    dateLabel: "DEC 08",
    dateText: "Tuesday, December 8, 2026",
    time: "12:00 PM – 3:00 PM",
    location: "Outpost Lawn",
    source: "ASI listing",
    officialUrl: ASI_EVENTS_URL,
    color: "from-teal-700 to-emerald-500",
    symbol: "✳",
    imageUrl: HUMMINGBIRD_PHOTO,
    imageAlt: "Illustrative stock photo of a hummingbird near a flower",
    photoCredit: "Y S",
    photoCreditUrl:
      "https://unsplash.com/photos/a-hummingbird-flying-over-a-flower-NmtVxqcKaNY",
  },
];

const CATEGORIES = [
  "All events",
  "Community",
  "Sustainability",
  "Wellness",
  "Creative",
  "Workshop",
];

function loadFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [month, setMonth] = useState("All dates");
  const [view, setView] = useState("explore");
  const [savedIds, setSavedIds] = useState(() =>
    loadFromStorage("beach-life-saved-events"),
  );
  const [registeredIds, setRegisteredIds] = useState(() =>
    loadFromStorage("beach-life-registered-events"),
  );
  const [organizerEvents, setOrganizerEvents] = useState(() =>
    loadFromStorage("beach-life-organizer-events"),
  );
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useMemo(
    () => [
      ...EVENTS,
      ...organizerEvents.filter((event) => event.status === "published"),
    ],
    [organizerEvents],
  );

  useEffect(() => {
    localStorage.setItem("beach-life-saved-events", JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem(
      "beach-life-registered-events",
      JSON.stringify(registeredIds),
    );
  }, [registeredIds]);

  useEffect(() => {
    localStorage.setItem(
      "beach-life-organizer-events",
      JSON.stringify(organizerEvents),
    );
  }, [organizerEvents]);

  useEffect(() => {
    if (!selectedEvent) return;

    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedEvent(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedEvent]);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const isInMyEvents =
        savedIds.includes(event.id) || registeredIds.includes(event.id);
      const matchesView = view === "explore" || isInMyEvents;
      const matchesCategory =
        category === "All events" || event.category === category;
      const matchesMonth =
        month === "All dates" || event.dateLabel.startsWith(month);
      const searchText =
        `${event.title} ${event.category} ${event.location}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());

      return matchesView && matchesCategory && matchesMonth && matchesQuery;
    });
  }, [category, events, month, query, registeredIds, savedIds, view]);

  function toggleSaved(id) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id],
    );
  }

  function toggleRegistration(id) {
    setRegisteredIds((current) =>
      current.includes(id)
        ? current.filter((registeredId) => registeredId !== id)
        : [...current, id],
    );
  }

  function saveOrganizerEvent(event) {
    setOrganizerEvents((current) => {
      if (event.id) {
        return current.map((item) =>
          item.id === event.id ? { ...item, ...event } : item,
        );
      }

      return [...current, { ...event, id: `organizer-${Date.now()}` }];
    });
  }

  function deleteOrganizerEvent(id) {
    setOrganizerEvents((current) => current.filter((event) => event.id !== id));
  }

  function toggleOrganizerStatus(id) {
    setOrganizerEvents((current) =>
      current.map((event) =>
        event.id === id
          ? {
              ...event,
              status: event.status === "published" ? "draft" : "published",
            }
          : event,
      ),
    );
  }

  if (view === "organizer") {
    return (
      <OrganizerDashboard
        events={organizerEvents}
        onBack={() => setView("explore")}
        onSave={saveOrganizerEvent}
        onDelete={deleteOrganizerEvent}
        onToggleStatus={toggleOrganizerStatus}
      />
    );
  }

  const myEventsCount = new Set([...savedIds, ...registeredIds]).size;

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#142f43]">
      <header className="border-b border-[#e5e1d7] bg-[#f7f5ef]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a
            href="#"
            className="leading-tight"
            aria-label="Beach Life events home"
          >
            <span className="block text-xl font-black tracking-tight">
              beach<span className="text-[#e5aa27]">life</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              student events
            </span>
          </a>

          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <button
              onClick={() => setView("explore")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                view === "explore"
                  ? "bg-[#142f43] text-white"
                  : "text-[#142f43] hover:bg-white"
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setView("saved")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                view === "saved"
                  ? "bg-[#142f43] text-white"
                  : "text-[#142f43] hover:bg-white"
              }`}
            >
              My events
              <span className="ml-2 rounded-full bg-[#e5aa27] px-2 py-0.5 text-xs text-[#142f43]">
                {myEventsCount}
              </span>
            </button>
            <button
              onClick={() => setView("organizer")}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#142f43] hover:bg-white"
            >
              Organizer
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#173b53] px-7 py-10 text-white sm:px-12 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-16 h-64 w-64 rounded-full bg-[#e5aa27]/90"
          />
          <div
            aria-hidden="true"
            className="absolute right-48 top-40 h-20 w-20 rounded-full bg-[#45a69b]"
          />
          <div className="relative max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#f5cf67]">
              Find your people. Find your thing.
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Make campus
              <br />
              your place to be.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80">
              Discover gatherings, workshops, and ways to connect at the Beach.
            </p>
            <a
              href="#events"
              className="mt-7 inline-flex rounded-full bg-[#f5cf67] px-6 py-3 text-sm font-bold text-[#142f43] transition hover:bg-white"
            >
              Explore events{" "}
              <span className="ml-2" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25877f]">
              The Beach calendar
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {view === "saved" ? "Your events" : "What’s happening"}
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {visibleEvents.length}{" "}
            {visibleEvents.length === 1 ? "event" : "events"}
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_190px]">
          <label className="sr-only" htmlFor="event-search">
            Search events
          </label>
          <input
            id="event-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by event, category, or location"
            className="w-full rounded-2xl border border-[#deded7] bg-white px-5 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#25877f] focus:ring-4 focus:ring-[#25877f]/10"
          />

          <label className="sr-only" htmlFor="event-month">
            Filter by month
          </label>
          <select
            id="event-month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="rounded-2xl border border-[#deded7] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#25877f] focus:ring-4 focus:ring-[#25877f]/10"
          >
            <option>All dates</option>
            <option value="NOV">November 2026</option>
            <option value="DEC">December 2026</option>
          </select>
        </div>

        <div
          className="mb-8 flex gap-2 overflow-x-auto pb-2"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === item
                  ? "bg-[#142f43] text-white"
                  : "border border-[#deded7] bg-white text-[#142f43] hover:border-[#25877f]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {visibleEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-bold">No events found</p>
            <p className="mt-2 text-sm text-slate-500">
              Try another search or check a different category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleEvents.map((event) => {
              const isSaved = savedIds.includes(event.id);
              const isRegistered = registeredIds.includes(event.id);

              return (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-3xl border border-[#e5e1d7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`relative h-40 overflow-hidden bg-gradient-to-br ${event.color}`}
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.imageAlt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(imageEvent) => {
                          imageEvent.currentTarget.style.display = "none";
                          imageEvent.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          );
                        }}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 flex items-center justify-center text-6xl text-white ${
                        event.imageUrl ? "hidden" : ""
                      }`}
                    >
                      {event.symbol}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#142f43]/70 via-transparent to-black/10" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                      {event.source}
                    </span>
                    {event.imageUrl && (
                      <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                        Illustrative photo
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#e4f1eb] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#17665f]">
                        {event.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {event.dateLabel}
                      </span>
                    </div>

                    {isRegistered && (
                      <p className="mt-3 text-xs font-bold text-[#25877f]">
                        You’re registered
                      </p>
                    )}

                    <h3 className="mt-4 min-h-14 text-lg font-extrabold leading-snug">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">{event.time}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.location}
                    </p>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="flex-1 rounded-xl bg-[#142f43] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#25877f]"
                      >
                        View details
                      </button>
                      <button
                        onClick={() => toggleSaved(event.id)}
                        aria-label={
                          isSaved
                            ? `Remove ${event.title} from My events`
                            : `Save ${event.title}`
                        }
                        aria-pressed={isSaved}
                        className="rounded-xl border border-[#deded7] px-3 py-2.5 text-lg transition hover:border-[#e5aa27]"
                      >
                        {isSaved ? "★" : "☆"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-xs text-slate-500">
          Portfolio concept. Demo organizer events are labeled. Event details
          come from ASI’s public listing.
        </p>
      </section>

      {selectedEvent && (
        <>
          <button
            aria-label="Close event details"
            className="fixed inset-0 z-40 cursor-default bg-[#0d1f2b]/60"
            onClick={() => setSelectedEvent(null)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-dialog-title"
            className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#25877f]">
                  {selectedEvent.category} · {selectedEvent.source}
                </p>
                <h2
                  id="event-dialog-title"
                  className="mt-2 text-2xl font-black"
                >
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                aria-label="Close details"
                className="rounded-full border border-slate-200 px-3 py-1 text-xl hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl bg-[#f7f5ef] p-5 text-sm">
              <p>
                <strong>Date:</strong> {selectedEvent.dateText}
              </p>
              <p>
                <strong>Time:</strong> {selectedEvent.time}
              </p>
              <p>
                <strong>Location:</strong> {selectedEvent.location}
              </p>
              {selectedEvent.accessibilityNotes && (
                <p>
                  <strong>Accessibility:</strong>{" "}
                  {selectedEvent.accessibilityNotes}
                </p>
              )}
              {selectedEvent.registrationLimit && (
                <p>
                  <strong>Registration limit:</strong>{" "}
                  {selectedEvent.registrationLimit}
                </p>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              {selectedEvent.source === "ASI listing"
                ? "This preview displays the event details available in ASI’s public listing."
                : "This is a sample event created in the portfolio demo."}
            </p>

            {selectedEvent.officialUrl && (
              <p className="mt-3 text-sm">
                <a
                  href={selectedEvent.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#17665f] underline"
                >
                  View official ASI listing
                </a>
              </p>
            )}

            {selectedEvent.photoCreditUrl && (
              <p className="mt-3 text-xs text-slate-500">
                Illustrative photo by{" "}
                <a
                  href={selectedEvent.photoCreditUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {selectedEvent.photoCredit}
                </a>{" "}
                on Unsplash. It is not a photo of this ASI event.
              </p>
            )}

            <button
              onClick={() => toggleRegistration(selectedEvent.id)}
              aria-pressed={registeredIds.includes(selectedEvent.id)}
              className="mt-6 w-full rounded-xl bg-[#142f43] px-4 py-3 font-bold text-white hover:bg-[#25877f]"
            >
              {registeredIds.includes(selectedEvent.id)
                ? "Cancel demo registration"
                : "Register for this event"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Demo registration is saved only in this browser.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
