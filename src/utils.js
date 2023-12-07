const { createReadStream, writeFileSync } = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/commits
async function getLatestCommitHash(getCommitUrl, accessToken) {
  try {
    const response = await fetch(getCommitUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return data.values[0].hash;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching commit data.");
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/src/{commit}/{path}
async function getFileContent(getFileContentUrl, accessToken) {
  try {
    const response = await fetch(getFileContentUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching commit data.");
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/refs/branches
async function createFeatureBranch(createBranchUrl, accessToken, branchName) {
  try {
    await fetch(createBranchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: branchName,
        target: { hash: "main" },
      }),
    });

    console.log(`Feature branch "${branchName}" created successfully.`);
  } catch (error) {
    console.error("Error creating feature branch:", error);
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/pullrequests
async function createPullRequest(createPrUrl, accessToken, branchName) {
  try {
    const bodyData = `
    {
      "title": ${branchName},
      "source": { "branch": { "name": ${branchName} } },
      "destination": { "branch": { "name": "main" } },
    }
    `;
    const response = await fetch(createPrUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: bodyData,
    });

    const data = await response.json();
    console.log("Pull request created successfully:", data.links.html.href);
  } catch (error) {
    console.error("Error creating pull request:", error);
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/src
async function createFileAndCommit(
  createCommitUrl,
  accessToken,
  packageJsonFileContent
) {
  try {
    writeFileSync(
      __dirname + "/package.json",
      JSON.stringify(packageJsonFileContent, null, 2)
    );

    const formData = new FormData();
    formData.append(`file`, createReadStream(__dirname + "/package.json"), {
      filename: "package.json",
      contentType: "application/json",
    });

    const response = await fetch(createCommitUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error pushing commit:", error.message || error);
  }
}

module.exports = {
  getLatestCommitHash,
  getFileContent,
  createFeatureBranch,
  createPullRequest,
  createFileAndCommit,
};
