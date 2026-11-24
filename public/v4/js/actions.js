import {
  addBooking,
  getBookings,
  seedSampleData,
  clearTodayBookings,
  updateBookingStatus,
  deleteBooking
} from "./storage.js";
import { renderAppointmentTable } from "./table.js";

const TABLE_CONTAINER_ID = "left-table-content";

export function refreshTableUI() {
  const bookings = getBookings();
  updateStatsHeader(bookings);

  renderAppointmentTable(TABLE_CONTAINER_ID, bookings, (action, record) => {
    handleRowAction(action, record);
  });
}

export function updateStatsHeader(bookings = getBookings()) {
  const countEl = document.getElementById("statTotalPatients");
  const waitingEl = document.getElementById("statWaitingPatients");
  const consultEl = document.getElementById("statConsultPatients");

  if (countEl) countEl.textContent = bookings.length;
  if (waitingEl) {
    const waitingCount = bookings.filter((b) => b.status === "WAITING").length;
    waitingEl.textContent = waitingCount;
  }
  if (consultEl) {
    const consultCount = bookings.filter((b) => b.status === "IN-CONSULT").length;
    consultEl.textContent = consultCount;
  }
}

export function handleRowAction(action, record) {
  if (!record || !record.id) return;

  if (action === "show") {
    // Call into consultation
    updateBookingStatus(record.id, "IN-CONSULT");
    showNotification(`🩺 Patient #${record.tokenNumber} (${record.patientName}) called into consultation!`, "success");
    refreshTableUI();
  } else if (action === "edit") {
    // Mark as completed
    updateBookingStatus(record.id, "COMPLETED");
    showNotification(`✅ Token #${record.tokenNumber} marked as COMPLETED.`, "info");
    refreshTableUI();
  } else if (action === "delete") {
    // Delete appointment
    if (confirm(`Cancel and remove appointment for Token #${record.tokenNumber} (${record.patientName})?`)) {
      deleteBooking(record.id);
      showNotification(`🗑 Token #${record.tokenNumber} removed.`, "warning");
      refreshTableUI();
    }
  }
}

export function showNotification(msg, type = "success") {
  const banner = document.getElementById("actionNotificationBanner");
  if (!banner) return;

  const bgClass = type === "success" ? "alert-success" : type === "info" ? "alert-info" : "alert-warning";
  banner.className = `alert ${bgClass} py-2 px-3 small mb-3 border-0 shadow-sm d-flex align-items-center justify-content-between`;
  banner.innerHTML = `<span>${msg}</span><button type="button" class="btn-close btn-sm" onclick="this.parentElement.style.display='none'"></button>`;
  banner.style.display = "flex";

  clearTimeout(banner._timer);
  banner._timer = setTimeout(() => {
    banner.style.display = "none";
  }, 4000);
}

export const actions = {
  onSavePatient: (event, matchElement) => {
    if (event) event.preventDefault();

    const nameInput = document.getElementById("patientName");
    const phoneInput = document.getElementById("phoneNumber");
    const notesInput = document.getElementById("notes");

    const patientName = nameInput?.value?.trim();
    const phoneNumber = phoneInput?.value?.trim();
    const notes = notesInput?.value?.trim() || "";

    if (!patientName) {
      alert("Please enter the patient's full name.");
      nameInput?.focus();
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      phoneInput?.focus();
      return;
    }

    // 1. Add booking to localStorage
    const newBooking = addBooking({
      patientName,
      phoneNumber,
      notes
    });

    // 2. Re-render table on left side immediately
    refreshTableUI();

    // 3. Show instant confirmation banner
    showNotification(
      `🎉 <strong>Token #${newBooking.tokenNumber} Allocated!</strong> ${newBooking.patientName} (${newBooking.phoneNumber}) added to queue.`,
      "success"
    );

    // 4. Reset form & autofocus
    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (notesInput) notesInput.value = "";
    nameInput?.focus();
  },

  onSeedData: () => {
    seedSampleData();
    refreshTableUI();
    showNotification("✨ 4 sample patients loaded into today's queue!", "info");
    const nameInput = document.getElementById("patientName");
    nameInput?.focus();
  },

  onClearToday: () => {
    if (confirm("Are you sure you want to clear all patient appointments for today?")) {
      clearTodayBookings();
      refreshTableUI();
      showNotification("🧹 Today's appointments cleared.", "warning");
      const nameInput = document.getElementById("patientName");
      nameInput?.focus();
    }
  }
};

export default actions;
