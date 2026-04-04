export type ClientConfig = {
  name: string;
  services: string[];
  hours: string;
  phone: string;
  faqs: string[];
  leadCapture: boolean;
};

const clients: Record<string, ClientConfig> = {
  // Test client — used for local development
  test: {
    name: "Test Business",
    services: ["Service A", "Service B", "Service C"],
    hours: "Mon–Fri 8am–6pm, Sat 9am–3pm",
    phone: "(555) 555-5555",
    faqs: [
      "Q: Do you offer free quotes? A: Yes, all quotes are free.",
      "Q: What areas do you serve? A: We serve the greater North Shore area.",
    ],
    leadCapture: true,
  },

  "mandc": {
    name: "M&C Luxury Detailing",
    services: [
      "Interior Detail (Bronze $129 / Silver $169 / Gold $219)",
      "Exterior Detail (Bronze $89 / Silver $129 / Gold $169)",
      "Full Detail (Bronze $189 / Silver $269 / Gold $359)",
      "Add-on: Pet Hair Removal $50",
    ],
    hours: "Mon–Sat 10am–6pm, closed Sunday",
    phone: "(781) 632-5193",
    faqs: [
      "Q: What's included in a Bronze Interior? A: Full vacuum, dashboard wipe-down, door panels, interior windows, and air freshener. Takes 1–2 hours.",
      "Q: What's included in a Silver Interior? A: Everything in Bronze plus steam clean, leather conditioning, and center console/vent deep clean. Takes 2–3 hours.",
      "Q: What's included in a Gold Interior? A: Everything in Silver plus carpet shampoo, seat shampoo, headliner wipe-down, and trunk detail. Takes 5–6 hours.",
      "Q: What's included in a Bronze Exterior? A: Hand wash, wheel and tire scrub, tire dressing, and exterior window cleaning. Takes about 1 hour.",
      "Q: What's included in a Silver Exterior? A: Everything in Bronze plus clay bar, trim dressing, door jamb wipe, and exterior wax. Takes 1.5–2 hours.",
      "Q: What's included in a Gold Exterior? A: Everything in Silver plus engine bay wipe-down and wheel well cleaning. Takes 2–2.5 hours.",
      "Q: Are you mobile? A: Yes, we come to you anywhere on the North Shore of MA.",
      "Q: Do prices vary by vehicle size? A: Yes, prices listed are starting rates for standard sedans. SUVs and heavily soiled vehicles may cost more.",
      "Q: Do you remove pet hair? A: Yes, pet hair removal is a $50 add-on.",
    ],
    leadCapture: true,
  },
};

export function getClient(clientId: string): ClientConfig | null {
  return clients[clientId] ?? null;
}
