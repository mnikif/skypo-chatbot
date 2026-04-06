import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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

function resolveAccess(pw: string | undefined): { authorized: boolean; clientId: string | null } {
  if (!pw) return { authorized: false, clientId: null };

  const raw = process.env.CLIENT_PASSWORDS;
  if (!raw) return { authorized: false, clientId: null };

  let map: Record<string, string>;
  try {
    map = JSON.parse(raw);
  } catch {
    return { authorized: false, clientId: null };
  }

  const entry = Object.entries(map).find(([, password]) => password === pw);
  if (!entry) return { authorized: false, clientId: null };

  const [clientId] = entry;
  return { authorized: true, clientId: clientId === 'admin' ? null : clientId };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}) {
  const params = await searchParams;
  const { authorized, clientId } = resolveAccess(params.pw);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">
            Add <code className="bg-gray-100 px-1 rounded">?pw=your_password</code> to the URL to access.
          </p>
        </div>
      </div>
    );
  }

  const allLeads = await getLeads();
  const leads = clientId ? allLeads.filter(l => l.client_id === clientId) : allLeads;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{leads.length} total leads captured</p>
          </div>
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
            Live
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm">No leads yet. Once visitors submit their info via the chatbot, they&apos;ll appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Summary</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-mono">
                        {lead.client_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{lead.name}</td>
                    <td className="py-3 px-4">
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{lead.summary ?? "—"}</td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
