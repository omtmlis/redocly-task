import { createReadStream, writeFileSync } from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/commits
export async function getLatestCommitHash(
  getCommitUrl: string,
  accessToken: string
): Promise<string> {
  try {
    const response = await fetch(getCommitUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data: any = await response.json();
    return data.values[0].hash;
  } catch (error: any) {
    console.log(error);
    throw new Error("Error fetching commit data.");
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/src/{commit}/{path}
export async function getFileContent(
  getFileContentUrl: string,
  accessToken: string
): Promise<{ [key: string]: any }> {
  try {
    const response = await fetch(getFileContentUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data: any = await response.json();
    return data;
  } catch (error: any) {
    console.log(error);
    throw new Error("Error fetching commit data.");
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/refs/branches
export async function createFeatureBranch(
  createBranchUrl: string,
  accessToken: string,
  branchName: string
): Promise<void> {
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
  } catch (error: any) {
    console.error("Error creating feature branch:", error);
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/pullrequests
export async function createPullRequest(
  createPrUrl: string,
  accessToken: string,
  branchName: string
): Promise<void> {
  try {
    const response = await fetch(createPrUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: branchName,
        source: { branch: { name: branchName } },
        destination: { branch: { name: "main" } },
      }),
    });

    const data: any = await response.json();
    console.log("Pull request created successfully:", data.links.html.href);
  } catch (error) {
    console.error("Error creating pull request:", error);
  }
}

// https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/src
export async function createFileAndCommit(
  createCommitUrl: string,
  accessToken: string,
  packageJsonFileContent: { [key: string]: any }
) {
  try {
    writeFileSync(
      "./package.json",
      JSON.stringify(packageJsonFileContent, null, 2)
    );

    const formData = new FormData();
    formData.append(`files`, createReadStream("./package.json"));

    const response = await fetch(createCommitUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Error pushing commit:", error.message || error);
  }
}
