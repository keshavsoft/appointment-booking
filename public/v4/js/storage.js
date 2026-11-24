// Storage Adapter for V-4 Tabular Roster & Vertical Form
const STORAGE_KEY_PREFIX = "carecall_booking_";

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSessionConfig() {
  return {
    doctorName: "Dr. Aditya (MBBS, MD)",
    clinicName: "CareCall Clinic & Consultation",
    todayDate: getTodayDateString()
  };
}

export function getBookings(date = getTodayDateString()) {
  const key = `${STORAGE_KEY_PREFIX}bookings_${date}`;
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveAllBookings(bookings, date = getTodayDateString()) {
  const key = `${STORAGE_KEY_PREFIX}bookings_${date}`;
  localStorage.setItem(key, JSON.stringify(bookings));
}

export function getNextTokenNumber(date = getTodayDateString()) {
  const bookings = getBookings(date);
  if (bookings.length === 0) return 1;
  const maxToken = Math.max(...bookings.map((b) => Number(b.tokenNumber) || 0));
  return maxToken + 1;
}

export function addBooking(bookingData, date = getTodayDateString()) {
  const bookings = getBookings(date);
  const tokenNumber = getNextTokenNumber(date);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newBooking = {
    id: `b-${Date.now()}`,
    tokenNumber,
    patientName: (bookingData.patientName || "").trim(),
    phoneNumber: (bookingData.phoneNumber || "").trim(),
    notes: (bookingData.notes || "").trim() || "General Checkup",
    status: "WAITING",
    bookedAt: timeStr
  };

  bookings.push(newBooking);
  saveAllBookings(bookings, date);
  return newBooking;
}

export function updateBookingStatus(id, newStatus, date = getTodayDateString()) {
  const bookings = getBookings(date);
  const target = bookings.find((b) => b.id === id);
  if (target) {
    target.status = newStatus;
    saveAllBookings(bookings, date);
  }
  return bookings;
}

export function deleteBooking(id, date = getTodayDateString()) {
  const bookings = getBookings(date).filter((b) => b.id !== id);
  saveAllBookings(bookings, date);
  return bookings;
}

export function clearTodayBookings(date = getTodayDateString()) {
  saveAllBookings([], date);
}

export function seedSampleData(date = getTodayDateString()) {
  const samples = [
    {
      id: "b-1",
      tokenNumber: 1,
      patientName: "Ramesh Kumar",
      phoneNumber: "9848163021",
      notes: "Follow-up BP Check",
      status: "WAITING",
      bookedAt: "10:15 AM"
    },
    {
      id: "b-2",
      tokenNumber: 2,
      patientName: "Sita Devi",
      phoneNumber: "9440281145",
      notes: "Fever & Cold",
      status: "IN-CONSULT",
      bookedAt: "10:30 AM"
    },
    {
      id: "b-3",
      tokenNumber: 3,
      patientName: "Anand Verma",
      phoneNumber: "9988224411",
      notes: "Routine Blood Work Review",
      status: "WAITING",
      bookedAt: "10:45 AM"
    },
    {
      id: "b-4",
      tokenNumber: 4,
      patientName: "Priya Sharma",
      phoneNumber: "9123456789",
      notes: "Migraine Consultation",
      status: "WAITING",
      bookedAt: "11:00 AM"
    }
  ];

  saveAllBookings(samples, date);
  return samples;
}
