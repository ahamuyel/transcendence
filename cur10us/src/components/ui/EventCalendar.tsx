"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ChevronLeft, ChevronRight } from "lucide-react"
import 'react-calendar/dist/Calendar.css'
import { CalendarProps } from "react-calendar"

const CalendarDynamic = dynamic(() => import("react-calendar"), { ssr: false })

const EventCalendar = () => {
    const [value, setValue] = useState<Date | null>(new Date())
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) return <div className="w-full h-[320px] sm:h-[400px] animate-pulse bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl" />

    const handleChange: CalendarProps["onChange"] = (val) => {
        if (val instanceof Date) setValue(val)
        else if (Array.isArray(val)) setValue(val[0] ?? null)
        else setValue(null)
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-5 w-full transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CalendarDynamic
                onChange={handleChange}
                value={value}
                className="react-calendar-custom"
                next2Label={null}
                prev2Label={null}
                nextLabel={<ChevronRight size={20} className="text-zinc-400 hover:text-indigo-600 transition-colors" />}
                prevLabel={<ChevronLeft size={20} className="text-zinc-400 hover:text-indigo-600 transition-colors" />}
                navigationLabel={({ date }) => (
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100 font-bold text-base sm:text-xl px-1">
                        <span className="capitalize">{date.toLocaleString('pt', { month: 'long' })}</span>
                        <span className="text-zinc-400 font-medium">{date.getFullYear()}</span>
                    </div>
                )}
                formatShortWeekday={(locale, date) =>
                    date.toLocaleDateString('pt', { weekday: 'short' }).replace('.', '').substring(0, 3)
                }
                tileClassName={({ date: tileDate, view }) => {
                    if (view !== "month") return ""

                    const today = new Date()
                    const isToday = tileDate.toDateString() === today.toDateString()
                    const isSelected = value instanceof Date && tileDate.toDateString() === value.toDateString()

                    return `
                        relative flex items-center justify-center transition-all duration-200
                        aspect-square w-full rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium
                        ${isToday ? 'border-2 border-indigo-600/30 text-indigo-600 dark:text-indigo-400' : ''}
                        ${isSelected
                            ? '!bg-indigo-600 !text-white shadow-lg shadow-indigo-500/30 scale-90'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                    `
                }}
            />

            <style jsx global>{`
                .react-calendar-custom {
                    width: 100% !important;
                    border: none !important;
                    background: transparent !important;
                }
                .react-calendar__navigation {
                    display: flex;
                    margin-bottom: 1rem;
                    height: 40px;
                }
                .react-calendar__navigation button {
                    background: none !important;
                    border: none !important;
                    min-width: 36px;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: transparent !important;
                }
                .react-calendar__month-view__weekdays {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: 700 !important;
                    font-size: 0.65rem !important;
                    color: #a1a1aa !important;
                    padding-bottom: 0.25rem;
                }
                @media (min-width: 640px) {
                    .react-calendar__month-view__weekdays {
                        font-size: 0.75rem !important;
                        padding-bottom: 0.5rem;
                    }
                }
                .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none !important;
                    border: none !important;
                }
                .react-calendar__month-view__days {
                    display: grid !important;
                    grid-template-columns: repeat(7, 1fr) !important;
                    gap: 2px !important;
                }
                @media (min-width: 640px) {
                    .react-calendar__month-view__days {
                        gap: 4px !important;
                    }
                }
                .react-calendar__tile {
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: none !important;
                }
                .react-calendar__tile--active {
                    background: transparent !important;
                    color: inherit !important;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                    opacity: 0.3;
                }
            `}</style>
        </div>
    )
}

export default EventCalendar
