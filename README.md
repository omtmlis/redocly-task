# redocly-task

# Package Updater CLI

A Command Line Interface (CLI) tool for updating package.json in a Bitbucket repository and opening a pull request.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>

   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Crete .env file based on .env.example

## Usage

Run the CLI with the following command:

```
npm start -pkg <package-name> -v <new-version> -r <repository-slug> -w <workspace>
```

`Replace <package-name>, <new-version>, <repository-slug>, and <workspace> with the appropriate values. If any option is not provided, the CLI will use the default values from the environment variables`

Options

```
-pkg, --package <package>: Package name to update.
-v, --version <version>: New version of the package.
-r, --reposlug <reposlug>: Repository slug (optional).
-w, --workspace <workspace>: Workspace (optional).
```

## Example
```
npm start -- -pkg my-package -v 1.2.3 -r my-repo -w my-workspace
```