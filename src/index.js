const { Command } = require("commander");
const dotenv = require("dotenv");
const {
  createFeatureBranch,
  createFileAndCommit,
  createPullRequest,
  getFileContent,
  getLatestCommitHash,
} = require("./utils.js");

dotenv.config();

// TODO: change hardcoded auth
const accessToken = process.env.BITBUCKET_ACCESS_KEY || "";

const program = new Command();
program
  .version("1.0.0")
  .description(
    "CLI tool to update package.json in Bitbucket repo and open a pull request"
  )
  .requiredOption("-pkg, --package <package>", "Package name to update")
  .requiredOption("-v, --version <version>", "New version of the package")
  .option("-r, --reposlug <reposlug>", "Repository slug (optional)")
  .option("-w, --workspace <workspace>", "Workspace (optional)")
  .parse(process.argv);

const options = program.opts();

const packageName = options.package || "test";
const packageVersion = options.version || "test";
const repoSlug = options.reposlug || process.env.REPO_SLUG;
const workspace = options.workspace || process.env.WORKSPACE;

const baseApiUrl = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`;
const createBranchUrl = `${baseApiUrl}/refs/branches`;
const createPrUrl = `${baseApiUrl}/pullrequests`;
const getLatestCommitHashUrl = `${baseApiUrl}/commits/?include=main`;

// Run the script
async function main() {
  const featureBranchName = `package-json-update-${Date.now()}`;
  const createCommitUrl = `${baseApiUrl}/src/?branch=${featureBranchName}`;

  await createFeatureBranch(createBranchUrl, accessToken, featureBranchName);
  const commitHash = await getLatestCommitHash(
    getLatestCommitHashUrl,
    accessToken
  );

  const getFileContentUrl = `${baseApiUrl}/src/${commitHash}/package.json`;

  const packageJsonFileContent = await getFileContent(
    getFileContentUrl,
    accessToken
  );

  if (!packageJsonFileContent.dependencies) {
    packageJsonFileContent.dependencies = {};
  }
  packageJsonFileContent.dependencies[packageName] = `^${packageVersion}`;

  await createFileAndCommit(
    createCommitUrl,
    accessToken,
    packageJsonFileContent
  );

  await createPullRequest(createPrUrl, accessToken, featureBranchName);
}

main();
