"use client";

import { useState } from "react";

type Lead = {
  id: string;
  client_id: string;
  name: string;
  phone: string;
  summary: string | null;
  created_at: string;
};

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Summary</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelected(lead)}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 font-medium text-gray-900">{lead.name}</td>
                <td className="py-3 px-4 text-blue-600">{lead.phone}</td>
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

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                <a
                  href={`tel:${selected.phone}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  {selected.phone}
                </a>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="text-sm text-gray-700">
                {new Date(selected.created_at).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Conversation Summary</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selected.summary ?? "No summary available."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
