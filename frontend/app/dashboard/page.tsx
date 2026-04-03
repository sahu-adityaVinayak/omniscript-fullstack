import { TopNav } from "@/components/TopNav";

export default function DashboardPage() {
  return (
    <main className="shell">
      <TopNav />

      <section className="card hero">
        <h1>Welcome to OmniScript</h1>
        <p>
          Your workspace is ready. Open the profile menu on the right to access AI Detector,
          Paraphraser, Humanizer, Profile settings, and Password security.
        </p>
      </section>
    </main>
  );
}
