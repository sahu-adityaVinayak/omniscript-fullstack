import { TopNav } from "@/components/TopNav";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export default function HumanizerPage() {
  return (
    <main className="shell">
      <TopNav />
      <ToolWorkspace
        tool="humanizer"
        title="AI Text Humanizer"
        subtitle="Transform robotic content into natural, human-like writing."
      />
    </main>
  );
}
