// Declarative Actions Dictionary for V-2
import {
  addBooking,
  updateBookingStatus,
  seedDemoData,
  clearDayData
} from "./storage.js";
import { generateSlots } from "./booking.js";
import {
  renderSlots,
  renderRoster,
  showSuccessModal,
  closeSuccessModal
} from "./dom.js";

export const state = {
  selectedSlotId: null,
  currentFilter: "ALL",
  searchTerm: ""
};

export const actions = {
  onBookingSubmit: (e, form) => {
    e.preventDefault();
    const nameInput = form.querySelector("#patientName");
    const phoneInput = form.querySelector("#phoneNumber");
    const patientName = nameInput?.value.trim();
    const phoneNumber = phoneInput?.value.trim();

    if (!patientName) {
      alert("Please enter patient name.");
      nameInput?.focus();
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      phoneInput?.focus();
      return;
    }

    const slots = generateSlots();
    const slot = slots.find((s) => s.id === state.selectedSlotId);
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

    form.reset();
    nameInput?.focus();
    showSuccessModal(newBooking);

    state.selectedSlotId = renderSlots(state.selectedSlotId);
    renderRoster(state.currentFilter, state.searchTerm);
  },

  onSearchFilter: (e, searchInput) => {
    state.searchTerm = searchInput.value;
    renderRoster(state.currentFilter, state.searchTerm);
  },

  onFilterTabChange: (e, tab) => {
    document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    state.currentFilter = tab.getAttribute("data-filter") || "ALL";
    renderRoster(state.currentFilter, state.searchTerm);
  },

  onSlotSelect: (e, slotEl) => {
    document.querySelectorAll(".slot-option").forEach((el) => el.classList.remove("selected"));
    slotEl.classList.add("selected");
    state.selectedSlotId = slotEl.getAttribute("data-slot-id");
  },

  onCheckInClick: (e, btn) => {
    const id = btn.getAttribute("data-id");
    updateBookingStatus(id, "WAITING");
    state.selectedSlotId = renderSlots(state.selectedSlotId);
    renderRoster(state.currentFilter, state.searchTerm);
  },

  onCallInClick: (e, btn) => {
    const id = btn.getAttribute("data-id");
    updateBookingStatus(id, "IN_CABIN");
    renderRoster(state.currentFilter, state.searchTerm);
  },

  onDoneClick: (e, btn) => {
    const id = btn.getAttribute("data-id");
    updateBookingStatus(id, "COMPLETED");
    renderRoster(state.currentFilter, state.searchTerm);
  },

  onSeedDemoClick: () => {
    if (confirm("Load 6 sample appointments for demonstration?")) {
      seedDemoData();
      state.selectedSlotId = renderSlots(state.selectedSlotId);
      renderRoster(state.currentFilter, state.searchTerm);
    }
  },

  onClearAllClick: () => {
    if (confirm("Clear all appointments for today?")) {
      clearDayData();
      state.selectedSlotId = renderSlots(state.selectedSlotId);
      renderRoster(state.currentFilter, state.searchTerm);
    }
  },

  onCloseModalClick: () => {
    closeSuccessModal();
  },

  onCopyWhatsAppClick: () => {
    const token = document.getElementById("modalTokenNumber")?.textContent;
    const name = document.getElementById("modalPatientName")?.textContent;
    const slot = document.getElementById("modalSlotTime")?.textContent;
    const text = `Hospital Appointment Confirmed:\nToken: #${token}\nPatient: ${name}\nSlot: ${slot}\nPlease reach the clinic 10 minutes prior.`;

    navigator.clipboard.writeText(text).then(() => {
      alert("WhatsApp message copied to clipboard!");
    });
  }
};

export default actions;
