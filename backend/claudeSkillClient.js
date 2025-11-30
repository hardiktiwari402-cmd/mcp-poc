// backend/claudeSkillClient.js
// Human-friendly mock skill for MCP POC.
// Generates descriptive, readable changelogs from commits.

const DEFAULT_GROUPS = [
  "feat",
  "fix",
  "docs",
  "chore",
  "refactor",
  "perf",
  "others",
];
const COMMIT_KEYWORD_RE =
  /^(?<type>feat|fix|docs|chore|refactor|perf)(?:\((?<scope>[^)]+)\))?[:\s-]+(?<desc>.+)$/i;

/**
 * Map commit type to a human-friendly verb/phrase.
 */
const TYPE_VERB = {
  feat: "Added",
  fix: "Fixed",
  docs: "Updated documentation for",
  chore: "Performed maintenance on",
  refactor: "Refactored",
  perf: "Improved performance of",
  others: "Changes to",
};

/**
 * Parse a commit message's first line into structured parts.
 */
function parseCommitMessage(message = "") {
  const firstLine = (message || "").split("\n")[0].trim();
  const m = firstLine.match(COMMIT_KEYWORD_RE);
  if (m && m.groups) {
    return {
      type: (m.groups.type || "others").toLowerCase(),
      scope: (m.groups.scope || "").trim(),
      desc: (m.groups.desc || "").trim(),
      raw: firstLine,
    };
  }
  // fallback: try to detect keywords inside message, else treat as "others"
  const inline = firstLine.match(
    /(?:\b)(feat|fix|docs|chore|refactor|perf)(?:[:\s-]|\b)/i
  );
  return {
    type: inline ? inline[1].toLowerCase() : "others",
    scope: "",
    desc: firstLine,
    raw: firstLine,
  };
}

/**
 * Format a single commit into a descriptive sentence.
 */
function describeCommit(commit) {
  const parsed = parseCommitMessage(commit.message);
  const verb = TYPE_VERB[parsed.type] || TYPE_VERB["others"];
  const scopePart = parsed.scope ? ` (${parsed.scope})` : "";
  const desc = parsed.desc || parsed.raw || "<no message>";
  const author = commit.author || "unknown";
  const date = commit.date
    ? new Date(commit.date).toISOString().slice(0, 10)
    : "unknown date";

  // Build a slightly more natural sentence:
  // Example: "Added (auth): Add login flow — Introduced login flow to authenticate users (by Alice on 2025-11-01)"
  const short = `${verb}${scopePart}: ${desc} — by ${author} on ${date}`;
  return {
    group: parsed.type,
    text: short,
    desc,
    author,
    date,
    raw: parsed.raw,
    scope: parsed.scope,
  };
}

/**
 * Build a short highlight sentence for a group from top items.
 */
function buildGroupSummary(items, groupName, maxHighlights = 3) {
  if (!items || items.length === 0) return null;
  const verbs = {
    feat: "features",
    fix: "bug fixes",
    docs: "documentation updates",
    chore: "maintenance tasks",
    refactor: "refactors",
    perf: "performance improvements",
    others: "other changes",
  };
  const noun = verbs[groupName] || "changes";
  // Take up to maxHighlights distinct short descriptions (desc)
  const highlights = items.slice(0, maxHighlights).map((it) => {
    // Use desc but shorten if long
    const h = it.desc.length > 60 ? it.desc.slice(0, 57) + "..." : it.desc;
    return `"${h}"`;
  });
  const count = items.length;
  const hlText = highlights.join(", ");
  if (count === 1) {
    return `1 ${noun}: ${hlText}.`;
  }
  return `${count} ${noun} (highlights: ${hlText}).`;
}

/**
 * Main mock skill function — returns a descriptive changelog string.
 */
async function generateChangelogWithSkill(mcpContext) {
  try {
    const commits = mcpContext?.data?.commits || [];
    const repoName = mcpContext?.metadata?.repo || "unknown repo";
    const timestamp = new Date().toISOString().slice(0, 10);

    if (commits.length === 0) {
      return `Changelog for ${repoName}\n\nNo commits supplied in the context.`;
    }

    // Describe & group commits
    const grouped = DEFAULT_GROUPS.reduce((acc, g) => {
      acc[g] = [];
      return acc;
    }, {});
    commits.forEach((c) => {
      const item = describeCommit(c);
      const grp = DEFAULT_GROUPS.includes(item.group) ? item.group : "others";
      grouped[grp].push(item);
    });

    // Build output: header with summary
    let out = `Changelog for ${repoName}\nGenerated on ${timestamp}\n\n`;
    out += `Summary:\n`;

    // Overall summary: counts by group (only non-empty)
    const nonEmptyGroups = Object.entries(grouped).filter(
      ([, arr]) => arr.length > 0
    );
    const totalCommits = commits.length;
    const groupCounts = nonEmptyGroups
      .map(([k, arr]) => `${arr.length} ${k}`)
      .join(", ");
    out += `- Total commits: ${totalCommits}. Groups: ${groupCounts}.\n\n`;

    // Per-group sections with friendly sentences + bullets
    for (const [group, items] of Object.entries(grouped)) {
      if (!items.length) continue;

      // Human-friendly group title
      const titleMap = {
        feat: "Features",
        fix: "Bug fixes",
        docs: "Documentation",
        chore: "Maintenance",
        refactor: "Refactors",
        perf: "Performance",
        others: "Other changes",
      };
      out += `## ${titleMap[group] || group}\n`;

      // short summary sentence for the group
      const summary = buildGroupSummary(items, group, 3);
      if (summary) out += `${summary}\n\n`;

      // Provide bullets with slightly expanded descriptions
      items.forEach((it) => {
        out += `• ${it.text}\n`;
      });

      out += `\n`; // spacer between groups
    }

    // Footer / Next steps suggestion
    out += `Notes:\n- This changelog was generated from commit messages. For richer release notes, consider adding PR descriptions or annotation in commits.\n`;

    return out.trim();
  } catch (err) {
    console.error("Mock skill error:", err);
    throw new Error("Mock skill failed");
  }
}

module.exports = { generateChangelogWithSkill };
