export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="max-w-xl text-center px-6">
        <h1 className="text-3xl font-bold mb-4">Skypomedia Chatbot</h1>
        <p className="text-gray-400 mb-8">
          AI-powered website chatbot for local service businesses. Captures leads automatically.
        </p>
        <div className="bg-gray-900 rounded-xl p-6 text-left text-sm font-mono text-gray-300 mb-6">
          <p className="text-gray-500 mb-2">{`<!-- Add to any website -->`}</p>
          <p>{`<script src="https://your-domain.vercel.app/chatbot.js`}</p>
          <p className="pl-4">{`?client=your-client-id"></script>`}</p>
        </div>
        <a
          href="/dashboard"
          className="inline-block bg-white text-gray-950 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          View Dashboard →
        </a>
      </div>
    </main>
  );
}
