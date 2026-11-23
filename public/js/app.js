// Main Reception Application Logic
import {
  getBookings,
  addBooking,
  updateBookingStatus,
  seedDemoData,
  clearDayData,
  getTodayDateString,
  getSessionConfig
} from "./storage.js";
import { generateSlots } from "./booking.js";

let selectedSlotId = null;
let currentFilter = "ALL";

// DOM Elements
const slotsContainer = document.getElementById("slotsContainer");
const bookingForm = document.getElementById("bookingForm");
const patientNameInput = document.getElementById("patientName");
const phoneNumberInput = document.getElementById("phoneNumber");
const rosterTbody = document.getElementById("rosterTbody");
const searchInput = document.getElementById("searchInput");
const filterTabs = document.querySelectorAll(".filter-tab");
const todayDateEl = document.getElementById("todayDate");
const doctorInfoEl = document.getElementById("doctorInfo");
const totalBookedCountEl = document.getElementById("totalBookedCount");
const checkedInCountEl = document.getElementById("checkedInCount");

// Modal Elements
const successModal = document.getElementById("successModal");
const modalTokenNumber = document.getElementById("modalTokenNumber");
const modalPatientName = document.getElementById("modalPatientName");
const modalPhoneNumber = document.getElementById("modalPhoneNumber");
const modalSlotTime = document.getElementById("modalSlotTime");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCopyWhatsApp = document.getElementById("btnCopyWhatsApp");

// Buttons
const btnSeedDemo = document.getElementById("btnSeedDemo");
const btnClearAll = document.getElementById("btnClearAll");

// Initialize
export function init() {
  renderHeaderInfo();
  renderSlots();
  renderRoster();
  attachEventListeners();
  patientNameInput.focus();
}

function renderHeaderInfo() {
  const config = getSessionConfig();
  const dateStr = getTodayDateString();
  todayDateEl.textContent = `📅 ${dateStr}`;
  doctorInfoEl.textContent = `🩺 ${config.doctorName} (${config.startTime} – ${config.endTime})`;
}

function renderSlots() {
  const slots = generateSlots();
  slotsContainer.innerHTML = "";

  let firstAvailableSlotId = null;

  slots.forEach((slot) => {
    const slotEl = document.createElement("div");
    slotEl.className = `slot-option ${slot.isFull ? "slot-full" : ""}`;
    if (slot.id === selectedSlotId) slotEl.classList.add("selected");

    slotEl.innerHTML = `
      <span class="slot-time">🕒 ${slot.label}</span>
      <span class="slot-badge">${slot.bookedCount} / ${slot.capacity} Booked</span>
    `;

    if (!slot.isFull) {
      if (!firstAvailableSlotId) firstAvailableSlotId = slot.id;

      slotEl.addEventListener("click", () => {
        document.querySelectorAll(".slot-option").forEach((el) => el.classList.remove("selected"));
        slotEl.classList.add("selected");
        selectedSlotId = slot.id;
      });
    }

    slotsContainer.appendChild(slotEl);
  });

  // Default select first available slot if none selected
  if (!selectedSlotId || slots.find((s) => s.id === selectedSlotId)?.isFull) {
    selectedSlotId = firstAvailableSlotId;
    const activeEl = slotsContainer.querySelector(`[class*="slot-option"]:not(.slot-full)`);
    if (activeEl) activeEl.classList.add("selected");
  }
}

function renderRoster() {
  const bookings = getBookings();
  const searchTerm = searchInput.value.toLowerCase().trim();

  // Update Stats in header
  totalBookedCountEl.textContent = bookings.length;
  const waitingCount = bookings.filter((b) => b.status === "WAITING" || b.status === "IN_CABIN").length;
  checkedInCountEl.textContent = waitingCount;

  // Filter Bookings
  let filtered = bookings.filter((b) => {
    const matchesSearch =
      b.patientName.toLowerCase().includes(searchTerm) ||
      b.phoneNumber.includes(searchTerm) ||
      String(b.tokenNumber) === searchTerm;

    if (!matchesSearch) return false;

    if (currentFilter === "ALL") return true;
    if (currentFilter === "WAITING") return b.status === "WAITING" || b.status === "IN_CABIN";
    if (currentFilter === "BOOKED") return b.status === "BOOKED";
    if (currentFilter === "COMPLETED") return b.status === "COMPLETED";
    return true;
  });

  // Sort: Token number ascending
  filtered.sort((a, b) => a.tokenNumber - b.tokenNumber);

  if (filtered.length === 0) {
    rosterTbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No appointments found for this filter.</td>
      </tr>
    `;
    return;
  }

  rosterTbody.innerHTML = filtered
    .map((b) => {
      let actionHtml = "";
      if (b.status === "BOOKED") {
        actionHtml = `<button class="btn-action btn-checkin" data-id="${b.id}">✓ Check In</button>`;
      } else if (b.status === "WAITING") {
        actionHtml = `<button class="btn-action btn-call" data-id="${b.id}" data-action="call">📞 Call In</button>`;
      } else if (b.status === "IN_CABIN") {
        actionHtml = `<button class="btn-action btn-secondary" data-id="${b.id}" data-action="done">Done ✓</button>`;
      } else {
        actionHtml = `<span style="color:var(--text-dim);font-size:0.8rem">Finished</span>`;
      }

      return `
      <tr>
        <td>
          <div class="token-pill">${b.tokenNumber}</div>
        </td>
        <td>
          <div class="patient-info">
            <span class="patient-name">${escapeHtml(b.patientName)}</span>
            <span class="patient-phone">📞 ${escapeHtml(b.phoneNumber)}</span>
          </div>
        </td>
        <td>
          <span style="font-weight:600;font-size:0.85rem">${b.slotLabel}</span>
        </td>
        <td>
          <span class="status-badge status-${b.status}">${formatStatus(b.status)}</span>
        </td>
        <td>${actionHtml}</td>
      </tr>
    `;
    })
    .join("");

  // Attach button handlers inside table
  rosterTbody.querySelectorAll(".btn-checkin").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      updateBookingStatus(id, "WAITING");
      renderRoster();
      renderSlots();
    });
  });

  rosterTbody.querySelectorAll(".btn-call").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      updateBookingStatus(id, "IN_CABIN");
      renderRoster();
    });
  });

  rosterTbody.querySelectorAll("[data-action='done']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      updateBookingStatus(id, "COMPLETED");
      renderRoster();
    });
  });
}

function formatStatus(status) {
  if (status === "BOOKED") return "Booked (Phone)";
  if (status === "WAITING") return "Waiting in Lounge";
  if (status === "IN_CABIN") return "Inside Cabin";
  if (status === "COMPLETED") return "Completed";
  return status;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function attachEventListeners() {
  // Booking Form Submission
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const patientName = patientNameInput.value.trim();
    const phoneNumber = phoneNumberInput.value.trim();

    if (!patientName) {
      alert("Please enter patient name.");
      patientNameInput.focus();
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      phoneNumberInput.focus();
      return;
    }

    const slots = generateSlots();
    const slot = slots.find((s) => s.id === selectedSlotId);
    if (!slot || slot.isFull) {
      alert("Selected slot is full. Please pick another slot.");
      return;
    }

    const newBooking = addBooking({
      patientName,
      phoneNumber,
      slotId: slot.id,
      slotLabel: slot.label,
      bookingType: "PHONE"
    });

    // Reset Form
    bookingForm.reset();
    patientNameInput.focus();

    // Show Confirmation Modal
    showSuccessModal(newBooking);

    // Refresh UI
    renderSlots();
    renderRoster();
  });

  // Search input
  searchInput.addEventListener("input", () => {
    renderRoster();
  });

  // Filter tabs
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter");
      renderRoster();
    });
  });

  // Seed Demo Data Button
  btnSeedDemo.addEventListener("click", () => {
    if (confirm("Load 6 sample appointments for demonstration?")) {
      seedDemoData();
      renderSlots();
      renderRoster();
    }
  });

  // Clear Day Data Button
  btnClearAll.addEventListener("click", () => {
    if (confirm("Clear all appointments for today?")) {
      clearDayData();
      renderSlots();
      renderRoster();
    }
  });

  // Modal Close
  btnCloseModal.addEventListener("click", () => {
    successModal.classList.remove("active");
  });

  // Copy WhatsApp confirmation text
  btnCopyWhatsApp.addEventListener("click", () => {
    const text = `Hospital Appointment Confirmed:\nToken: #${modalTokenNumber.textContent}\nPatient: ${modalPatientName.textContent}\nSlot: ${modalSlotTime.textContent}\nPlease reach the clinic 10 minutes prior.`;
    navigator.clipboard.writeText(text).then(() => {
      alert("WhatsApp text copied to clipboard!");
    });
  });
}

function showSuccessModal(booking) {
  modalTokenNumber.textContent = booking.tokenNumber;
  modalPatientName.textContent = booking.patientName;
  modalPhoneNumber.textContent = booking.phoneNumber;
  modalSlotTime.textContent = booking.slotLabel;
  successModal.classList.add("active");
}

init();
