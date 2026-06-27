"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../../../components/DashboardSidebar";
import PageHeader from "../../../components/PageHeader";

type Supply = {
  id: number;
  crop_name: string;
  crop_variety: string | null;
  quantity: number;
  unit: string;
  planting_date: string;
  expected_harvest_date: string;
  location: string;
  status: string;
};

type Booking = {
  id: number;
  buyer_id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
  supply_location: string;
  demand_location: string;
};

type CalendarEvent = {
  id: string;
  dateKey: string;
  kind: "planting" | "harvest";
  label: string;
  crop: string;
  location: string;
  status: string;
};

type CalendarDay = {
  date: Date | null;
  key: string;
};

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function toDate(value: string) {
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return toDate(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-KE", {
    month: "long",
    year: "numeric",
  });
}

function buildMonthDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  const days: CalendarDay[] = [];

  for (let index = 0; index < mondayFirstOffset; index += 1) {
    days.push({ date: null, key: `empty-start-${index}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({ date, key: toDateKey(date) });
  }

  while (days.length % 7 !== 0) {
    days.push({ date: null, key: `empty-end-${days.length}` });
  }

  return days;
}

function eventLabel(event: CalendarEvent) {
  return event.kind === "planting" ? `Plant ${event.crop}` : `Harvest ${event.crop}`;
}

export default function FarmerCalendarPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCalendar() {
      try {
        const [suppliesResponse, bookingsResponse] = await Promise.all([
          fetch("/api/supplies", { credentials: "include" }),
          fetch("/api/bookings", { credentials: "include" }),
        ]);

        const suppliesData = await suppliesResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (!suppliesResponse.ok) {
          throw new Error(suppliesData.message || "Failed to load calendar data");
        }

        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.message || "Failed to load booking data");
        }

        if (active) {
          setSupplies(suppliesData.supplies ?? []);
          setBookings(bookingsData.bookings ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load calendar data");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCalendar();

    return () => {
      active = false;
    };
  }, []);

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  const events = useMemo<CalendarEvent[]>(() => {
    return supplies.flatMap((supply) => [
      {
        id: `${supply.id}-planting`,
        dateKey: toDateKey(toDate(supply.planting_date)),
        kind: "planting" as const,
        label: "PLANTING",
        crop: supply.crop_name,
        location: supply.location,
        status: supply.status,
      },
      {
        id: `${supply.id}-harvest`,
        dateKey: toDateKey(toDate(supply.expected_harvest_date)),
        kind: "harvest" as const,
        label: "PEAK HARVEST",
        crop: supply.crop_name,
        location: supply.location,
        status: supply.status,
      },
    ]);
  }, [supplies]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((grouped, event) => {
      grouped[event.dateKey] = [...(grouped[event.dateKey] ?? []), event];
      return grouped;
    }, {});
  }, [events]);

  const selectedEvents = eventsByDate[selectedDateKey] ?? [];
  const visibleMonthEvents = events.filter((event) => {
    const date = toDate(event.dateKey);
    return date.getFullYear() === visibleMonth.getFullYear() && date.getMonth() === visibleMonth.getMonth();
  });
  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled").slice(0, 4);

  function moveMonth(direction: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  function showToday() {
    const today = new Date();
    setVisibleMonth(today);
    setSelectedDateKey(toDateKey(today));
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main crop-calendar-page">
        <PageHeader
          eyebrow="Crop calendar"
          title="Crop planning calendar"
          description="Plan planting cycles, monitor harvest windows, and keep buyer bookings visible from one working calendar."
        />

        <section className="crop-calendar-board" aria-label="Dynamic crop planning calendar">
          <div className="crop-calendar-toolbar">
            <div>
              <p className="wireframe-label">CROP PLANNING CALENDAR</p>
              <h2>{formatMonth(visibleMonth)}</h2>
            </div>

            <div className="calendar-actions" aria-label="Calendar month controls">
              <button type="button" onClick={() => moveMonth(-1)}>
                Previous
              </button>
              <button type="button" onClick={showToday}>
                Today
              </button>
              <button type="button" onClick={() => moveMonth(1)}>
                Next
              </button>
            </div>
          </div>

          {loading ? (
            <p className="calendar-system-message">Loading crop calendar...</p>
          ) : error ? (
            <p className="calendar-system-message">{error}</p>
          ) : (
            <div className="crop-calendar-layout">
              <div className="crop-calendar-frame">
                <div className="crop-calendar-weekdays">
                  {weekDays.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="crop-calendar-grid">
                  {monthDays.map((day) => {
                    const dateKey = day.date ? toDateKey(day.date) : day.key;
                    const dayEvents = day.date ? eventsByDate[dateKey] ?? [] : [];
                    const isToday = day.date ? dateKey === toDateKey(new Date()) : false;
                    const isSelected = dateKey === selectedDateKey;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={`crop-calendar-day${day.date ? "" : " crop-calendar-day-empty"}${
                          isToday ? " is-today" : ""
                        }${isSelected ? " is-selected" : ""}`}
                        onClick={() => day.date && setSelectedDateKey(dateKey)}
                        disabled={!day.date}
                      >
                        {day.date && <span className="calendar-date-number">{day.date.getDate()}</span>}
                        <span className="calendar-event-stack">
                          {dayEvents.slice(0, 3).map((event) => (
                            <span key={event.id} className={`calendar-event calendar-event-${event.kind}`}>
                              <strong>{event.label}</strong>
                              <small>{event.crop}</small>
                            </span>
                          ))}
                          {dayEvents.length > 3 && <small className="calendar-more">+{dayEvents.length - 3} more</small>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <aside className="crop-calendar-inspector" aria-label="Selected date crop activities">
                <p className="wireframe-label">SELECTED DAY</p>
                <h3>{formatDate(selectedDateKey)}</h3>
                {selectedEvents.length === 0 ? (
                  <p>No crop activity logged for this day.</p>
                ) : (
                  <div className="selected-event-list">
                    {selectedEvents.map((event) => (
                      <article key={event.id}>
                        <span className={`calendar-note ${event.kind}`}>{event.label}</span>
                        <strong>{eventLabel(event)}</strong>
                        <p>{event.location}</p>
                        <small>Status: {event.status}</small>
                      </article>
                    ))}
                  </div>
                )}

                <div className="calendar-summary-box">
                  <span>{visibleMonthEvents.length}</span>
                  <p>crop activities this month</p>
                </div>
              </aside>
            </div>
          )}

          <div className="crop-calendar-lower-panel">
            <Link href="/farmer/supplies/new" className="calendar-log-button">
              Log new crop planting cycle
            </Link>

            <section className="active-contracts-panel" aria-label="Active booking contracts">
              <div className="active-contracts-heading">
                <p className="wireframe-label">ACTIVE BOOKING CONTRACTS</p>
                <Link href="/farmer/bookings">View all</Link>
              </div>

              {loading ? (
                <p>Loading contracts...</p>
              ) : activeBookings.length === 0 ? (
                <p>No active booking contracts yet.</p>
              ) : (
                <div className="contract-grid">
                  {activeBookings.map((booking) => (
                    <article key={booking.id} className="contract-card">
                      <div>
                        <strong>Buyer #{booking.buyer_id}</strong>
                        <p>
                          Qty: {booking.quantity} {booking.unit} {booking.crop_name}
                        </p>
                        <p>Date: {formatDate(booking.created_at)}</p>
                      </div>
                      <span>{booking.status}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
