import { TopNav } from "@/components/TopNav";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export default function DetectorPage() {
  return (
    <main className="shell">
      <TopNav />
      <ToolWorkspace
        tool="detector"
        title="AI Detector"
        subtitle="Paste text and run AI-likelihood analysis using your backend model endpoint."
      />
    </main>
  );
}
