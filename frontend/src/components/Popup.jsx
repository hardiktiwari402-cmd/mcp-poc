import React from "react";

export default function DemoPopup({ open, onClose }) {
  if (!open) return null;

  const demoText = `MCP + Claude Skill POC

1) UI Trigger
- I enter a GitHub repo and click "Generate".
- The frontend posts to /generate-changelog.
- File: frontend/src/App.jsx

2) Backend fetches commits
- Backend fetches real commits from GitHub API.
- Persists them to Mongo for inspection.
- Files: backend/server.js, backend/githubFetcher.js

3) MCP Context Creation
- Backend constructs an MCP-formatted context:
  {
    metadata: { purpose: "generate_changelog", repo: "owner/repo", timestamp: "..." },
    data: { commits: [...] }
  }
- File: backend/server.js
- MCP is a structured protocol (metadata + data), not a server.

4) Skill Request Wrapper
- MCP context is wrapped into a skillRequest:
  { mcp_version: "1.0", context: <mcpContext>, instructions: { task: "Generate a changelog..." } }
- File: backend/claudeSkillClient.js

5) Local Mock Skill (Important!)
- This POC uses a local mock skill function (generateChangelogWithSkill) instead of an external Claude endpoint.
- Why:
  • No hosting or API keys required
  • Faster iteration for a POC
  • Mock reproduces the skill contract (same request/response shape)
- File: backend/claudeSkillClient.js

6) Changelog Generation
- The mock skill reads MCP context, groups commits (feat/fix/docs/chore/...), and returns a descriptive changelog.

7) Response & Display
- Backend returns { changelog } and frontend displays it.
- Files: backend/server.js, frontend/src/App.jsx

One-line summary:
"We build an MCP-formatted context from GitHub commits, pass it to a skill (mock here), and get a descriptive changelog — demonstrating the MCP → Skill lifecycle without needing an external endpoint."`;

  return (
    <div
      style={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Demo script"
    >
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 18 }}>MCP + Claude Skill</h2>
          <button aria-label="Close" onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </header>

        <main style={styles.body}>
          <pre style={styles.pre}>{demoText}</pre>
        </main>

        <footer style={styles.footer}>
          <button onClick={onClose} style={styles.ghostBtn}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "min(920px, 96%)",
    maxHeight: "86vh",
    background: "#fff",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
    padding: 6,
  },
  body: {
    flex: 1,
    overflow: "auto",
  },
  pre: {
    whiteSpace: "pre-wrap",
    fontSize: 13,
    lineHeight: 1.45,
    background: "#f7f7f8",
    padding: 12,
    borderRadius: 6,
    margin: 0,
    color: "#111",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  primaryBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid #2b6cb0",
    background: "#2b6cb0",
    color: "#fff",
    cursor: "pointer",
  },
  ghostBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
};
