require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { fetchRecentCommits } = require("./githubFetcher");
const { generateChangelogWithSkill } = require("./claudeSkillClient");
const { Commit } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect(process.env.MONGO_URI, {});

app.post("/generate-changelog", async (req, res) => {
  try {
    const { owner, repo } = req.body;
    if (!owner || !repo)
      return res.status(400).send({ error: "owner & repo required" });

    const commits = await fetchRecentCommits(owner, repo);

    // await Commit.deleteMany({ owner, repo });
    const docs = commits.map((c) => ({
      owner,
      repo,
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
    }));
    // await Commit.insertMany(docs);

    //mcp context for the skill (simulated mcp payload)
    const mcpContext = {
      metadata: {
        purpose: "generate_changelog",
        repo: `${owner}/${repo}`,
        source: "github_commits",
        timestamp: new Date().toISOString(),
      },
      data: {
        commits: docs.slice(0, 30),
      },
    };

    // call the Claude Skill with the MCP payload
    const changelog = await generateChangelogWithSkill(mcpContext);

    return res.send({ changelog });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.get("/commits/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;
  const list = await Commit.find({ owner, repo })
    .sort({ date: -1 })
    .limit(50)
    .lean();
  res.send({ commits: list });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
