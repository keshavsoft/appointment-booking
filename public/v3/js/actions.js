// Actions for V-3
import { addBooking } from "./storage.js";
import { generateSlots } from "./booking.js";
import { renderSlots, showConfirmation } from "./dom.js";

export const state = {
  selectedSlotId: null
};

export const actions = {
  onSlotSelect: (e, slotCard) => {
    const slotId = slotCard.getAttribute("data-slot-id");
    state.selectedSlotId = slotId;

    document.querySelectorAll(".slot-card").forEach((el) => el.classList.remove("selected"));
    slotCard.classList.add("selected");

    const slots = generateSlots();
    const activeSlot = slots.find((s) => s.id === slotId);
    const banner = document.getElementById("selectedSlotName");
    if (banner && activeSlot) {
      banner.textContent = activeSlot.label;
    }
  },

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
      alert("Please enter a valid 10-digit mobile number.");
      phoneInput?.focus();
      return;
    }

    const slots = generateSlots();
    const slot = slots.find((s) => s.id === state.selectedSlotId);
    if (!slot || slot.isFull) {
      alert("Selected slot is full. Please pick another time slot.");
      return;
    }

    const booking = addBooking({
      patientName,
      phoneNumber,
      slotId: slot.id,
      slotLabel: slot.label
    });

    form.reset();
    nameInput?.focus();

    showConfirmation(booking);
    state.selectedSlotId = renderSlots(state.selectedSlotId);
  }
};

export default actions;
