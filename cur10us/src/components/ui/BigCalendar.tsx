"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  View,
  Views,
  ToolbarProps,
} from "react-big-calendar";
import moment from "moment";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/big-calendar.css";
import "moment/locale/pt-br";

moment.locale("pt-br");

const localizer = momentLocalizer(moment);

type CalendarEvent = {
  title?: string;
  start: Date;
  end: Date;
  type?: string;
  teacher?: string;
  room?: string;
};

const COLORS = [
  "#6366f1", "#10B981", "#F59E0B", "#06B6D4", "#f43f5e",
  "#8b5cf6", "#ec4899", "#14b8a6", "#a855f7", "#f97316",
];

const DAY_MAP: Record<string, number> = {
  "Segunda": 1, "Terça": 2, "Quarta": 3, "Quinta": 4, "Sexta": 5,
};

const views = [
  { key: Views.MONTH, label: "Mês" },
  { key: Views.WORK_WEEK, label: "Semana" },
  { key: Views.DAY, label: "Dia" },
];

const CalendarHeader: React.FC<ToolbarProps<CalendarEvent, object>> = ({
  date,
  view,
  onView,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
        <h2 className="text-sm sm:text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">
          {moment(date).format("MMMM YYYY")}
        </h2>
        <button
          onClick={() => onNavigate("NEXT")}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("TODAY")}
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-zinc-700 dark:text-zinc-300"
        >
          Hoje
        </button>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 sm:p-1">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => onView(v.key)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg transition
                ${
                  view === v.key
                    ? "bg-white dark:bg-zinc-700 shadow text-indigo-600 dark:text-indigo-400 font-medium"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BigCalendar = () => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [calendarHeight, setCalendarHeight] = useState(500);
  const [hiddenSubjects, setHiddenSubjects] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectColors, setSubjectColors] = useState<Record<string, string>>({});

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lessons?limit=200");
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();

      const colorMap: Record<string, string> = {};
      let colorIdx = 0;

      const mapped: CalendarEvent[] = (json.data || []).map((lesson: { day: string; startTime: string; endTime: string; room?: string; subject?: { name: string }; teacher?: { name: string } }) => {
        const subjectName = lesson.subject?.name || "Aula";
        if (!colorMap[subjectName]) {
          colorMap[subjectName] = COLORS[colorIdx % COLORS.length];
          colorIdx++;
        }

        const dayNum = DAY_MAP[lesson.day] || 1;
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

        const eventDate = new Date(monday);
        eventDate.setDate(monday.getDate() + (dayNum - 1));

        const [sh, sm] = lesson.startTime.split(":").map(Number);
        const [eh, em] = lesson.endTime.split(":").map(Number);

        const start = new Date(eventDate);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(eventDate);
        end.setHours(eh, em, 0, 0);

        return {
          title: subjectName,
          start,
          end,
          type: subjectName,
          teacher: lesson.teacher?.name,
          room: lesson.room,
        };
      });

      setSubjectColors(colorMap);
      setEvents(mapped);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setView(Views.DAY);
        setCalendarHeight(400);
      } else if (width < 1024) {
        setCalendarHeight(500);
      } else {
        setCalendarHeight(600);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const toggleSubject = (subject: string) => {
    setHiddenSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const filteredEvents = useMemo(
    () => events.filter((e) => !hiddenSubjects.has(e.type || "")),
    [hiddenSubjects, events]
  );

  const activeSubjects = useMemo(() => {
    const types = new Set<string>();
    for (const e of events) {
      if (e.type) types.add(e.type);
    }
    return Array.from(types).sort();
  }, [events]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const bg = subjectColors[event.type || ""] || "#64748b";
    return {
      style: {
        backgroundColor: bg,
        borderRadius: "8px",
        border: "none",
        color: "#fff",
        fontSize: "0.7rem",
        padding: "2px 4px",
        boxShadow: `0 1px 3px ${bg}66`,
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <>
      {activeSubjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeSubjects.map((subject) => {
            const color = subjectColors[subject] || "#64748b";
            const isHidden = hiddenSubjects.has(subject);
            return (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition
                  ${
                    isHidden
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                      : "text-white"
                  }`}
                style={!isHidden ? { backgroundColor: color } : undefined}
              >
                {subject}
              </button>
            );
          })}
        </div>
      )}

      <div className="cur10us-calendar bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 sm:p-4 overflow-hidden">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          views={{ month: true, work_week: true, day: true }}
          view={view}
          onView={setView}
          min={new Date(2025, 0, 1, 7, 30)}
          max={new Date(2025, 0, 1, 17, 30)}
          formats={{
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) =>
              `${moment(start).format("HH:mm")} – ${moment(end).format("HH:mm")}`,
          }}
          dayLayoutAlgorithm="no-overlap"
          scrollToTime={new Date(2025, 0, 1, 7, 30)}
          showMultiDayTimes
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          components={{ toolbar: CalendarHeader }}
          style={{ height: calendarHeight }}
        />
      </div>

      {activeSubjects.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 px-1">
          {activeSubjects.map((subject) => {
            const color = subjectColors[subject] || "#64748b";
            return (
              <div key={subject} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {subject}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedEvent.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {moment(selectedEvent.start).format("HH:mm")} – {moment(selectedEvent.end).format("HH:mm")}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            {selectedEvent.type && (
              <span
                className="inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  backgroundColor: subjectColors[selectedEvent.type] || "#64748b",
                }}
              >
                {selectedEvent.type}
              </span>
            )}

            <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {selectedEvent.teacher && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 dark:text-zinc-500">Professor:</span>
                  <span className="font-medium">{selectedEvent.teacher}</span>
                </div>
              )}
              {selectedEvent.room && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 dark:text-zinc-500">Sala:</span>
                  <span className="font-medium">{selectedEvent.room}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-6 w-full rounded-xl bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 transition active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BigCalendar;
