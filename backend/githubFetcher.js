const axios = require("axios");

async function fetchRecentCommits(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
  const res = await axios.get(url, {
    headers: {
      Authorization: process.env.GITHUB_TOKEN
        ? `token ${process.env.GITHUB_TOKEN}`
        : undefined,
      "User-Agent": "mcp-poc",
    },
    params: { per_page: 50 },
  });
  return res.data;
}

module.exports = { fetchRecentCommits };
