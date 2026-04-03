import { TopNav } from "@/components/TopNav";

export default function DashboardPage() {
  return (
    <main className="shell">
      <TopNav />

      <section className="card hero">
        <h1>Welcome to OmniScript AI Workspace</h1>
        <p>
          OmniScript helps students, creators, founders, and teams transform text with confidence.
          Open your profile menu to access AI Detector, Paraphraser, Humanizer, account settings,
          and security controls.
        </p>
        <div className="hero-cta">
          <span className="badge-pill">AI Detector</span>
          <span className="badge-pill">Paraphraser</span>
          <span className="badge-pill">Humanizer</span>
          <span className="badge-pill">Secure Account</span>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 18 }}>
        <article className="feature card">
          <h3>What Is This Site For?</h3>
          <p>
            OmniScript is a writing improvement platform for identifying AI-style signals,
            rewriting content, and converting robotic text into naturally readable language.
          </p>
        </article>
        <article className="feature card">
          <h3>Why Use It?</h3>
          <p>
            Improve writing quality, reduce repetitive AI tone, and prepare cleaner drafts for
            blogs, assignments, emails, product pages, and social media content.
          </p>
        </article>
        <article className="feature card">
          <h3>How It Works</h3>
          <p>
            Choose a tool from your profile drawer, paste text, run analysis or transformation,
            then copy and refine the output for your final publishing workflow.
          </p>
        </article>
      </section>

      <section className="card section-block">
        <h2>Common Use Cases</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Students</h4>
            <p>Polish drafts, improve tone variety, and avoid overly robotic assignment language.</p>
          </div>
          <div className="faq-item">
            <h4>Content Creators</h4>
            <p>Rewrite scripts, captions, and blog text to make output feel more personal.</p>
          </div>
          <div className="faq-item">
            <h4>Startups & Teams</h4>
            <p>Standardize messaging quality for product copy, docs, and customer communication.</p>
          </div>
          <div className="faq-item">
            <h4>Freelancers</h4>
            <p>Deliver cleaner, client-ready writing while preserving original intent and context.</p>
          </div>
        </div>
      </section>

      <section className="card section-block">
        <h2>FAQs</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h4>Is this fully automatic?</h4>
            <p>
              It is designed to accelerate writing workflows, but you should still review output for
              tone, factual consistency, and brand voice.
            </p>
          </div>
          <div className="faq-item">
            <h4>Why can output quality vary?</h4>
            <p>
              Output quality improves significantly when a provider API key is configured. Without it,
              the app uses a local fallback engine for baseline transformations.
            </p>
          </div>
          <div className="faq-item">
            <h4>Can I update my account details?</h4>
            <p>
              Yes. Use Profile to change name/email and Security to reset password via OTP verification.
            </p>
          </div>
        </div>
      </section>

      <section className="card section-block contact-block">
        <h2>Contact Us</h2>
        <p>
          For support, feedback, and collaboration: <strong>adityaaasitis55@gmail.com</strong>
        </p>
      </section>
    </main>
  );
}
