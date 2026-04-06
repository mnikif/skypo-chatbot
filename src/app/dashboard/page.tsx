import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { verifySession } from "@/lib/session";
import LeadsTable from "./LeadsTable";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  client_id: string;
  name: string;
  phone: string;
  summary: string | null;
  created_at: string;
};

async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch leads:", error);
    return [];
  }
  return data ?? [];
}

function getClientName(clientId: string | null): string | null {
  if (!clientId) return null;
  const raw = process.env.CLIENT_NAMES;
  if (!raw) return null;
  try {
    const map: Record<string, string> = JSON.parse(raw);
    return map[clientId] ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const clientIdFromSession = token ? verifySession(token) : null;

  if (!clientIdFromSession) {
    redirect("/login");
  }

  const isAdmin = clientIdFromSession === "admin";
  const clientId = isAdmin ? null : clientIdFromSession;

  const allLeads = await getLeads();
  const leads = clientId ? allLeads.filter((l) => l.client_id === clientId) : allLeads;
  const businessName = getClientName(clientId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            {businessName && (
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-1">{businessName}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">Leads Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{leads.length} total leads captured</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              Live
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm">No leads yet. Once visitors submit their info via the chatbot, they&apos;ll appear here.</p>
          </div>
        ) : (
          <LeadsTable leads={leads} />
        )}
      </div>
    </div>
  );
}
