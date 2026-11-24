import { render, hookEvents } from "../vendor/json-renderers-build-table.v57.min.js";

export const tableColumns = [
  { columnName: "tokenNumber", displayName: "Token #" },
  { columnName: "patientName", displayName: "Patient Name" },
  { columnName: "phoneNumber", displayName: "Mobile No" },
  { columnName: "notes", displayName: "Reason / Notes" },
  { columnName: "bookedAt", displayName: "Time" },
  { columnName: "status", displayName: "Status" }
];

export function renderAppointmentTable(containerId, bookings = [], onRowAction = null) {
  render({
    data: bookings,
    columns: tableColumns,
    targetHtmlId: containerId,
    type: "table.simple",
    options: {
      search: { showLabel: true, showHelper: true, showInput: true },
      serial: false,
      options: { showButton: true, showEditButton: true, showDeleteButton: true }
    },
    appendPosition: "replace",
    classToApply: "table table-hover align-middle mb-0"
  });

  hookEvents({
    container: containerId,
    dataset: bookings,
    columns: tableColumns,
    type: "table.simple",
    options: {
      search: { showLabel: true, showHelper: true, showInput: true },
      serial: false,
      options: { showButton: true, showEditButton: true, showDeleteButton: true }
    },
    onRowAction: (action, record, rowIndex) => {
      if (typeof onRowAction === "function") {
        onRowAction(action, record, rowIndex);
      }
    }
  });
}
