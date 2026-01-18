import UserInterface from "./components/UserInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">User Management</h1>
      <p className="text-gray-400 mb-8">Fullstack Rust + Next.js App</p>
      <UserInterface backendName="rust" />
    </main>
  );
}
