import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import { Send, MessageCircle, Phone, Video, CheckCircle2, XCircle, Edit3, Trash2, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CollaborationRequest, Entrepreneur, Investor, AvailabilitySlot } from '../types';
import {
  createCollaborationRequest,
  getRequestsForEntrepreneur,
  getRequestsFromInvestor,
  updateRequestStatus
} from '../data/collaborationRequests';
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getAvailabilitySlotsForUser,
  updateAvailabilitySlot
} from '../data/availabilitySlots';
import { findUserById, getUsersByRole } from '../data/users';

const formatTime = (time24: string) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const MeetingCalendar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [message, setMessage] = useState('');
  const [selectedCounterpartId, setSelectedCounterpartId] = useState('');
  const [meetingDate, setMeetingDate] = useState(toIsoDate(new Date()));
  const [meetingTime, setMeetingTime] = useState('10:00');

  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [slotDate, setSlotDate] = useState(toIsoDate(new Date()));
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');

  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');

  const isInvestor = user?.role === 'investor';
  const isEntrepreneur = user?.role === 'entrepreneur';

  const entrepreneurs = getUsersByRole('entrepreneur') as Entrepreneur[];
  const investors = getUsersByRole('investor') as Investor[];

  const counterpartOptions = isInvestor
    ? entrepreneurs.map(e => ({ id: e.id, label: `${e.name} · ${e.startupName}` }))
    : investors.map(i => ({ id: i.id, label: `${i.name} · ${i.investmentInterests.join(', ')}` }));

  useEffect(() => {
    if (counterpartOptions.length && !selectedCounterpartId) {
      setSelectedCounterpartId(counterpartOptions[0].id);
    }
  }, [counterpartOptions, selectedCounterpartId]);

  const location = useLocation();

  // Prefill counterpart if URL contains ?requestTo=<userId>
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestTo = params.get('requestTo');
    if (requestTo && counterpartOptions.find(c => c.id === requestTo)) {
      setSelectedCounterpartId(requestTo);
    }
  }, [location.search, counterpartOptions]);

  useEffect(() => {
    if (!user) return;
    setRequests(isInvestor ? getRequestsFromInvestor(user.id) : getRequestsForEntrepreneur(user.id));
    setAvailabilitySlots(getAvailabilitySlotsForUser(user.id));
  }, [user, isInvestor]);

  if (!user) return null;

  const refreshData = () => {
    if (!user) return;
    setRequests(isInvestor ? getRequestsFromInvestor(user.id) : getRequestsForEntrepreneur(user.id));
    setAvailabilitySlots(getAvailabilitySlotsForUser(user.id));
  };

  const selectedDateString = toIsoDate(selectedDate);
  const availableSlotsForDate = availabilitySlots.filter(slot => slot.date === selectedDateString);
  const confirmedRequests = requests.filter(request => request.status === 'accepted');
  const confirmedRequestsOnDate = confirmedRequests.filter(request =>
    request.meetingDate ? isSameDay(new Date(request.meetingDate), selectedDate) : false
  );
  const requestList = requests.filter(request =>
    request.meetingDate ? isSameDay(new Date(request.meetingDate), selectedDate) : false
  );

  const totalPending = requests.filter(request => request.status === 'pending').length;
  const totalAccepted = confirmedRequests.length;

  const currentUserLabel = isInvestor ? 'Investor view' : 'Entrepreneur view';
  const calendarHeader = isInvestor ? 'Investor meeting requests' : 'Entrepreneur scheduling';
  const currentTitle = isInvestor ? 'Investor meeting center' : 'Entrepreneur meeting hub';

  const getCounterpartyId = (request: CollaborationRequest) =>
    isInvestor ? request.entrepreneurId : request.investorId;

  const isOutgoingRequest = (request: CollaborationRequest) =>
    (isInvestor && request.initiatorRole === 'investor') ||
    (isEntrepreneur && request.initiatorRole === 'entrepreneur');

  const hasMeetingsOnDate = (date: Date) =>
    requests.some(request => request.meetingDate && isSameDay(new Date(request.meetingDate), date));

  const hasAvailabilityOnDate = (date: Date) =>
    availabilitySlots.some(slot => slot.date === toIsoDate(date));

  const sendMeetingRequest = () => {
    if (!message.trim() || !selectedCounterpartId || !user) return;

    if (isInvestor) {
      createCollaborationRequest(
        user.id,
        selectedCounterpartId,
        message.trim(),
        meetingDate,
        formatTime(meetingTime),
        'investor'
      );
    } else if (isEntrepreneur) {
      createCollaborationRequest(
        selectedCounterpartId,
        user.id,
        message.trim(),
        meetingDate,
        formatTime(meetingTime),
        'entrepreneur'
      );
    }

    const partner = findUserById(selectedCounterpartId);
    setSendSuccessMessage(
      `Meeting request sent to ${partner?.name || 'your selected contact'} for ${new Date(meetingDate).toLocaleDateString()} at ${formatTime(meetingTime)}.`
    );
    setMessage('');
    setMeetingDate(toIsoDate(new Date()));
    setMeetingTime('10:00');
    refreshData();
  };

  const handleScheduleRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMeetingRequest();
  };

  const handleQuickSend = () => {
    sendMeetingRequest();
  };

  const handleRequestAction = (requestId: string, newStatus: 'accepted' | 'rejected') => {
    updateRequestStatus(requestId, newStatus);
    refreshData();
  };

  const handleSaveAvailability = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !slotStartTime || !slotEndTime || !slotDate) return;

    if (selectedSlotId) {
      updateAvailabilitySlot(selectedSlotId, slotDate, slotStartTime, slotEndTime);
    } else {
      createAvailabilitySlot(user.id, slotDate, slotStartTime, slotEndTime);
    }

    setSelectedSlotId('');
    setSlotStartTime('09:00');
    setSlotEndTime('10:00');
    setSlotDate(toIsoDate(new Date()));
    refreshData();
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setSelectedSlotId(slot.id);
    setSlotDate(slot.date);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
  };

  const handleRemoveSlot = (slotId: string) => {
    deleteAvailabilitySlot(slotId);
    if (selectedSlotId === slotId) {
      setSelectedSlotId('');
      setSlotStartTime('09:00');
      setSlotEndTime('10:00');
      setSlotDate(toIsoDate(new Date()));
    }
    refreshData();
  };

  const handleOpenChat = (request: CollaborationRequest) => {
    const partnerId = getCounterpartyId(request);
    navigate(`/chat/${partnerId}`);
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <span>📅</span> {currentTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{calendarHeader}. Manage availability, send meeting requests, and confirm meetings from one dashboard.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">
          {currentUserLabel} • {user.name}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr] mt-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <Calendar
            onChange={value => setSelectedDate(value as Date)}
            value={selectedDate}
            className="w-full border-none bg-transparent max-h-[420px] overflow-auto"
            tileContent={({ date, view }) =>
              view === 'month' ? (
                <div className="mt-1 flex flex-col items-center gap-1">
                  {hasAvailabilityOnDate(date) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  {hasMeetingsOnDate(date) && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                </div>
              ) : null
            }
          />

          <div className="mt-4 rounded-3xl bg-indigo-50 border border-indigo-100 px-4 py-4 text-sm text-indigo-700">
            <p className="font-semibold text-indigo-900">Selected date</p>
            <p className="mt-1 text-sm">{selectedDate.toDateString()}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-indigo-700/90">
              <div className="rounded-2xl bg-white p-3 border border-indigo-100">
                <p className="font-semibold">Confirmed</p>
                <p>{totalAccepted}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 border border-indigo-100">
                <p className="font-semibold">Pending</p>
                <p>{totalPending}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Send meeting request</h3>
                <p className="text-xs text-slate-500 mt-1">Choose a recipient, date, time, and note for the meeting.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {isInvestor ? 'Investor request' : 'Entrepreneur request'}
              </span>
            </div>

            {sendSuccessMessage ? (
              <div className="mt-4 rounded-3xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
                <p className="font-semibold">Request sent</p>
                <p className="mt-1">{sendSuccessMessage}</p>
              </div>
            ) : null}

            <form onSubmit={handleScheduleRequest} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-slate-600">
                  <span className="text-xs font-medium text-slate-700">Send to</span>
                  <select
                    value={selectedCounterpartId}
                    onChange={event => setSelectedCounterpartId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    {counterpartOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="text-xs font-medium text-slate-700">Meeting date</span>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={event => setMeetingDate(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-slate-600">
                  <span className="text-xs font-medium text-slate-700">Meeting time</span>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={event => setMeetingTime(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="text-xs font-medium text-slate-700">Your note</span>
                  <input
                    type="text"
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    placeholder="Add a short agenda or greeting"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleQuickSend}
                  className="inline-flex items-center gap-2 rounded-3xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Send size={16} /> Quick send
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 rounded-3xl bg-white p-4 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Confirmed meetings on {selectedDate.toDateString()}</h3>
            {confirmedRequestsOnDate.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No confirmed meetings scheduled for this date.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {confirmedRequestsOnDate.map(request => {
                  const partner = findUserById(getCounterpartyId(request));
                  return (
                    <div key={request.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{partner?.name || 'Guest'}</p>
                          <p className="text-xs text-slate-500">{partner?.email || ''}</p>
                        </div>
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-indigo-700">{request.meetingTime}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{request.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.16em]">Availability</h3>
                <p className="text-xs text-slate-500 mt-1">Create and adjust your available meeting slots so peers can request a time that works.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <PlusCircle size={14} className="mr-1" /> {availabilitySlots.length} slots
              </span>
            </div>

            <form onSubmit={handleSaveAvailability} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-slate-600">
                  <span className="text-xs font-medium text-slate-700">Date</span>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={event => setSlotDate(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  <span className="text-xs font-medium text-slate-700">Start time</span>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={event => setSlotStartTime(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
              </div>
              <label className="block text-sm text-slate-600">
                <span className="text-xs font-medium text-slate-700">End time</span>
                <input
                  type="time"
                  value={slotEndTime}
                  onChange={event => setSlotEndTime(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-3xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  {selectedSlotId ? 'Update slot' : 'Add slot'}
                </button>
                {selectedSlotId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSlotId('');
                      setSlotDate(toIsoDate(new Date()));
                      setSlotStartTime('09:00');
                      setSlotEndTime('10:00');
                    }}
                    className="inline-flex items-center rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {availableSlotsForDate.length === 0 ? (
                <p className="text-sm text-slate-500">No availability saved for this date yet.</p>
              ) : (
                availableSlotsForDate.map(slot => (
                  <div key={slot.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{slot.startTime} - {slot.endTime}</p>
                      <p className="text-xs text-slate-500">{slot.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditSlot(slot)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                        aria-label="Edit availability"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700 transition hover:bg-rose-200"
                        aria-label="Delete availability"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.16em]">Meeting requests</h3>
                <p className="text-xs text-slate-500 mt-1">Manage pending requests, accept or decline invitations, and keep your schedule up to date.</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{requestList.length} today</span>
            </div>

            <div className="mt-4 space-y-3">
              {requestList.length === 0 ? (
                <p className="text-sm text-slate-500">No meeting requests for the selected date.</p>
              ) : (
                requestList.map(request => {
                  const partner = findUserById(getCounterpartyId(request));
                  const outgoing = isOutgoingRequest(request);

                  return (
                    <div key={request.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{partner?.name || 'Team member'}</p>
                          <p className="text-xs text-slate-500">{partner ? `${partner.email}` : ''}</p>
                          {outgoing ? <p className="text-xs text-indigo-600 mt-1">Request sent</p> : null}
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : request.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-600">
                        <p>{request.meetingDate ?? 'No date'} · {request.meetingTime ?? 'No time'}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenChat(request)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                            aria-label="Message"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      </div>

                      {request.status === 'pending' && !outgoing ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleRequestAction(request.id, 'accepted')}
                            className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={14} /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestAction(request.id, 'rejected')}
                            className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <XCircle size={14} /> Decline
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};