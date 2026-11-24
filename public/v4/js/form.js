import runInstructions from "../vendor/json-renderers-run-instructions-steps.v6.min.js";
import jsonToDom from "../vendor/json-to-dom.v42.min.js";

export const formColumns = [
  { columnName: "patientName" },
  { columnName: "phoneNumber" },
  { columnName: "notes" }
];

export function renderIntakeForm(containerId) {
  // 1. Build form specification using decoupled steps engine
  const formSpec = runInstructions({
    instructions: ["buildFormField"],
    baseKey: "formBase",
    data: { columns: formColumns }
  });

  // 2. Declaratively enrich form spec for clinic intake
  try {
    const titleEl = formSpec.children?.[0]?.children?.[0];
    if (titleEl) {
      titleEl.textContent = "🩺 Fast Patient Intake";
    }

    const submitBtn = formSpec.children?.[2]?.children?.[1];
    if (submitBtn) {
      submitBtn.textContent = "🎟 Allocate Token (Enter)";
      submitBtn.attributes.class = "btn btn-primary px-4 fw-bold shadow-sm";
    }

    const resetBtn = formSpec.children?.[2]?.children?.[0];
    if (resetBtn) {
      resetBtn.textContent = "Clear Form";
    }

    const formFields = formSpec.children?.[1]?.children?.[0]?.children || [];
    formFields.forEach((group) => {
      const label = group.children?.[0];
      const input = group.children?.[1];
      if (!input) return;

      if (input.attributes.id === "patientName") {
        label.textContent = "Patient Full Name *";
        input.attributes.placeholder = "e.g. Ramesh Kumar";
        input.attributes.required = "true";
        input.attributes.autofocus = "true";
      } else if (input.attributes.id === "phoneNumber") {
        label.textContent = "Mobile Number (10 digits) *";
        input.attributes.placeholder = "e.g. 9848163021";
        input.attributes.type = "tel";
        input.attributes.pattern = "[0-9]{10}";
        input.attributes.required = "true";
      } else if (input.attributes.id === "notes") {
        label.textContent = "Symptoms / Visit Reason";
        input.attributes.placeholder = "e.g. Fever, Follow-up, BP Check";
      }
    });
  } catch (err) {
    console.warn("[renderIntakeForm] Customization warning:", err);
  }

  // 3. Render directly into target container
  jsonToDom({
    jsonSpec: formSpec,
    targetHtmlId: containerId,
    appendPosition: "replace"
  });

  // 4. Autofocus patientName input for rapid keyboard flow
  setTimeout(() => {
    const input = document.getElementById("patientName");
    if (input) input.focus();
  }, 60);
}
