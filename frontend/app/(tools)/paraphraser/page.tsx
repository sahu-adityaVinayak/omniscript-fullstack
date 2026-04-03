import { TopNav } from "@/components/TopNav";
import { ToolWorkspace } from "@/components/ToolWorkspace";

export default function ParaphraserPage() {
  return (
    <main className="shell">
      <TopNav />
      <ToolWorkspace
        tool="paraphraser"
        title="Paraphraser"
        subtitle="Rewrite your text while keeping original meaning and improving flow."
      />
    </main>
  );
}
