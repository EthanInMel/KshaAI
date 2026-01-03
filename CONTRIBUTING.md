# Contributing to ksha

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them.

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
- [Styleguides](#styleguides)
  - [Commit Messages](#commit-messages)

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](https://docs.ksha.io).

Before you ask a question, it is best to search for existing [Issues](https://github.com/ksha/ksha/issues) that might help you. In case you've found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

## I Want To Contribute

### Reporting Bugs

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/ksha/ksha/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/ksha/ksha/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- **Open a new issue**.
- Describe the step-by-step behavior you want to see.
- Explain why this enhancement would be useful to most users.

### Your First Code Contribution

1. **Fork the repository** and clone it locally.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a branch for your edit:
   ```bash
   git checkout -b fix/amazing-fix
   ```
4. Make your changes.
5. Verify your changes:
   ```bash
   pnpm nx affected -t lint test build
   ```
6. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/).

## Styleguides

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages. This allows us to automatically generate changelogs and releases.

**Format**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Example**:
```
feat(stream): add support for websocket source
fix(api): handle timeout correctly in llm service
```
