import { addBooking, getBookings } from "./storage.js";
import { renderAppointmentTable } from "./table.js";

const TABLE_CONTAINER_ID = "left-table-content";

export function refreshTableUI() {
  const bookings = getBookings();
  renderAppointmentTable(TABLE_CONTAINER_ID, bookings);
}

export const actions = {
  onSavePatient: (event) => {
    if (event) event.preventDefault();

    const nameInput = document.getElementById("patientName");
    const phoneInput = document.getElementById("phoneNumber");
    const notesInput = document.getElementById("notes");

    const patientName = nameInput?.value?.trim();
    const phoneNumber = phoneInput?.value?.trim();
    const notes = notesInput?.value?.trim() || "";

    if (!patientName) {
      alert("Please enter patient full name.");
      nameInput?.focus();
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      phoneInput?.focus();
      return;
    }

    // 1. Add booking quietly to localStorage
    addBooking({
      patientName,
      phoneNumber,
      notes
    });

    // 2. Re-render table on left side immediately
    refreshTableUI();

    // 3. Reset form and autofocus immediately for next patient
    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (notesInput) notesInput.value = "";
    nameInput?.focus();
  }
};

export default actions;
