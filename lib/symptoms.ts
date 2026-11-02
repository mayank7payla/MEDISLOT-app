// Rule-based triage decision tree: symptoms -> recommended department.
// Pure data + logic, so it runs instantly in the browser with no API cost.
export type Option = { label: string; next?: string; dept?: string; emergency?: boolean; note?: string };
export type Node = { q: string; options: Option[] };

export const TREE: Record<string, Node> = {
  start: {
    q: "Where is your main problem?",
    options: [
      { label: "Chest, breathing or heart", next: "chest" },
      { label: "Stomach or digestion", next: "gut" },
      { label: "Head, nerves or dizziness", next: "head" },
      { label: "Bones, joints or muscles", next: "bone" },
      { label: "Skin, hair or nails", dept: "Dermatology" },
      { label: "Ear, nose or throat", dept: "ENT" },
      { label: "Child under 14", dept: "Pediatrics" },
      { label: "Women's health or pregnancy", dept: "Gynecology" },
      { label: "Fever, weakness or general illness", next: "general" },
    ],
  },
  chest: {
    q: "Do you have severe chest pain, pain spreading to the arm or jaw, or cold sweats?",
    options: [
      { label: "Yes", emergency: true },
      { label: "No, but I get breathless or have palpitations", dept: "Cardiology" },
      { label: "No, mainly cough or cold", dept: "General Medicine" },
    ],
  },
  gut: {
    q: "Is there severe belly pain, vomiting blood or black stools?",
    options: [
      { label: "Yes", emergency: true },
      { label: "No, recurring acidity, pain or bloating", dept: "Gastroenterology" },
      { label: "No, just loose motions or a mild upset", dept: "General Medicine" },
    ],
  },
  head: {
    q: "Sudden weakness on one side, slurred speech, or the worst headache of your life?",
    options: [
      { label: "Yes", emergency: true },
      { label: "No, frequent headaches, migraine, numbness or dizziness", dept: "Neurology" },
      { label: "No, mild headache with fever", dept: "General Medicine" },
    ],
  },
  bone: {
    q: "Is there visible deformity, or can you not move or put weight on the limb?",
    options: [
      { label: "Yes", emergency: true },
      { label: "No, pain or stiffness only", dept: "Orthopedics" },
    ],
  },
  general: {
    q: "How long have you had the fever or weakness?",
    options: [
      { label: "Less than 3 days", dept: "General Medicine" },
      { label: "More than a week, or fever above 103°F", dept: "General Medicine", note: "Needs prompt evaluation - book the earliest slot." },
    ],
  },
};
