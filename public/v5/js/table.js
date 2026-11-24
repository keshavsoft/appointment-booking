import { render } from "../vendor/json-renderers-build-table.v57.min.js";

// Clean columns strictly mirroring a physical OPD paper register
export const tableColumns = [
  { columnName: "tokenNumber", displayName: "Token #" },
  { columnName: "patientName", displayName: "Patient Name" },
  { columnName: "phoneNumber", displayName: "Mobile No" },
  { columnName: "notes", displayName: "Reason / Symptoms" },
  { columnName: "bookedAt", displayName: "Entry Time" }
];

export function renderAppointmentTable(containerId, bookings = []) {
  render({
    data: bookings,
    columns: tableColumns,
    targetHtmlId: containerId,
    type: "table.simple",
    options: {
      search: false,
      serial: false,
      options: false
    },
    appendPosition: "replace",
    classToApply: "table table-hover align-middle mb-0"
  });
}
