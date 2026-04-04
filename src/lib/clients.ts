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

  // Add clients here as you sell them, e.g.:
  // "north-shore-auto": {
  //   name: "North Shore Auto Detailing",
  //   services: ["Full Detail", "Interior Detail", "Exterior Wash"],
  //   hours: "Mon–Sat 8am–5pm",
  //   phone: "(978) 555-1234",
  //   faqs: ["Q: Do you come to me? A: Yes, we're fully mobile."],
  //   leadCapture: true,
  // },
};

export function getClient(clientId: string): ClientConfig | null {
  return clients[clientId] ?? null;
}
