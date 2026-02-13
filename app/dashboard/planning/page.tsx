'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, MapPin, Clock, CheckCircle } from 'lucide-react';
import PageLayout from '@/app/components/PageLayout';
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup date-fns localizer for react-big-calendar
const locales = { it };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface PlanningEvent extends Event {
  id: number;
  proprietario: string;
  tecnico: string;
  codcliente: string;
  cliente: string;
  oggetto: string;
  giornataintera: string;
  confermato: string;
  varie: string;
  eseguito: string;
  privato: string;
  colore: string;
  orainizio: string;
  orafine: string;
  data: string;
}

export default function PlanningPage() {
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>(null);
  // Inizia da oggi
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [allTecnici, setAllTecnici] = useState<string[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState<string>('all');

  // Fetch planning events
  const fetchEvents = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      // Get month boundaries
      const year = date.getFullYear();
      const month = date.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Format dates for API (YYYY-MM-DD)
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Fetch from API
      const params = new URLSearchParams({
        startDate: startStr,
        endDate: endStr,
        ...(selectedTecnico !== 'all' && { tecnico: selectedTecnico }),
      });

      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/dashboard/planning?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (data.events) {
        // Transform events for calendar
        const calendarEvents = data.events.map((event: any) => {
          const [year, month, day] = event.data.split('-');
          const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

          // Set time if provided
          if (event.orainizio) {
            const [hours, minutes] = event.orainizio.split(':');
            eventDate.setHours(parseInt(hours), parseInt(minutes));
          }

          // Compute end date/time
          let endDate = new Date(eventDate);
          if (event.orafine) {
            const [endHours, endMinutes] = event.orafine.split(':');
            endDate.setHours(parseInt(endHours), parseInt(endMinutes));
          } else {
            endDate.setHours(eventDate.getHours() + 1);
          }

          return {
            id: event.id,
            title: event.oggetto,
            start: eventDate,
            end: endDate,
            resource: event,
            ...event,
          };
        });

        setEvents(calendarEvents);

        // Extract unique tecnici for filter
        const tecnici = [
          ...new Set(data.events.map((e: any) => e.tecnico).filter(Boolean)),
        ] as string[];
        setAllTecnici(tecnici);
      }
    } catch (error) {
      console.error('Error fetching planning events:', error);
    }
    setLoading(false);
  }, [selectedTecnico]);

  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate, fetchEvents]);

  // Event style getter for colors
  const eventStyleGetter = (event: PlanningEvent) => {
    let backgroundColor = event.colore || '#3b82f6';
    let borderColor = event.colore || '#3b82f6';

    // Make colors darker for better contrast
    if (event.eseguito === 'S') {
      backgroundColor = 'rgba(' + hexToRgb(backgroundColor) + ', 0.5)';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: event.eseguito === 'S' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 4px',
        fontSize: '0.85em',
      },
    };
  };

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '59, 130, 246';
  }

  return (
    <PageLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Planning</h1>
          <p className='text-gray-600 mt-1'>Calendario appuntamenti e interventi</p>
        </div>

        {/* Controls */}
        <div className='flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow'>
          <div className='flex gap-2 items-center flex-wrap'>
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium'
            >
              ← Precedente
            </button>
            <input
              type="month"
              value={format(currentDate, 'yyyy-MM')}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
              }}
              className='px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:border-blue-500'
            />
            <div className='px-4 py-2 bg-gray-100 rounded text-sm font-semibold'>
              {format(currentDate, 'MMMM yyyy', { locale: it })}
            </div>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium'
            >
              Successivo →
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium'
            >
              Oggi
            </button>
          </div>

          <select
            value={selectedTecnico}
            onChange={(e) => setSelectedTecnico(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:border-blue-500'
          >
            <option value='all'>Tutti i tecnici</option>
            {allTecnici.map((tecnico) => (
              <option key={tecnico} value={tecnico}>
                {tecnico}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div className='bg-white rounded-lg shadow p-4' style={{ height: '700px' }}>
          {loading ? (
            <div className='flex items-center justify-center h-full'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
            </div>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor='start'
              endAccessor='end'
              style={{ height: '100%' }}
              onSelectEvent={(event: PlanningEvent) => setSelectedEvent(event)}
              eventPropGetter={(event: PlanningEvent) => eventStyleGetter(event)}
              culture='it'
              messages={{
                today: 'Oggi',
                previous: 'Precedente',
                next: 'Successivo',
                month: 'Mese',
                week: 'Settimana',
                day: 'Giorno',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Ora',
                event: 'Evento',
                work_week: 'Settimana lavorativa',
              }}
            />
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full'>
              {/* Modal Header */}
              <div className='bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center'>
                <h2 className='text-xl font-bold text-white'>{selectedEvent.oggetto}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className='text-white hover:bg-slate-700 p-2 rounded'
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className='p-6 space-y-4'>
                {/* Status Badges */}
                <div className='flex gap-2 flex-wrap'>
                  {selectedEvent.confermato === 'S' && (
                    <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'>
                      ✓ Confermato
                    </span>
                  )}
                  {selectedEvent.eseguito === 'S' && (
                    <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
                      ✓ Eseguito
                    </span>
                  )}
                  {selectedEvent.privato === 'S' && (
                    <span className='bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium'>
                      🔒 Privato
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-start gap-3'>
                    <Calendar className='w-5 h-5 text-slate-600 mt-1' />
                    <div>
                      <p className='text-sm text-gray-600'>Data</p>
                      <p className='font-semibold text-gray-900'>
                        {selectedEvent.data}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Clock className='w-5 h-5 text-slate-600 mt-1' />
                    <div>
                      <p className='text-sm text-gray-600'>Orario</p>
                      <p className='font-semibold text-gray-900'>
                        {selectedEvent.orainizio} - {selectedEvent.orafine}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Users className='w-5 h-5 text-slate-600 mt-1' />
                    <div>
                      <p className='text-sm text-gray-600'>Tecnico</p>
                      <p className='font-semibold text-gray-900'>
                        {selectedEvent.tecnico}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <MapPin className='w-5 h-5 text-slate-600 mt-1' />
                    <div>
                      <p className='text-sm text-gray-600'>Cliente</p>
                      <p className='font-semibold text-gray-900'>
                        {selectedEvent.cliente || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedEvent.varie && (
                  <div className='border-t pt-4'>
                    <p className='text-sm text-gray-600 mb-2'>Note</p>
                    <p className='bg-gray-50 p-3 rounded text-gray-900'>
                      {selectedEvent.varie}
                    </p>
                  </div>
                )}

                {/* Color Indicator */}
                {selectedEvent.colore && (
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-8 h-8 rounded border-2 border-gray-300'
                      style={{ backgroundColor: selectedEvent.colore }}
                    ></div>
                    <span className='text-sm text-gray-600'>
                      Colore: {selectedEvent.colore}
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className='border-t bg-gray-50 px-6 py-4 flex justify-end gap-3'>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium text-sm'
                >
                  Chiudi
                </button>
                <button className='px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-sm'>
                  Modifica
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
