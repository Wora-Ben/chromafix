# Security Policy

## Supported Versions

chromafix is pre-1.0; security fixes land on the latest published release.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, use GitHub's private vulnerability reporting: go to the
[**Security** tab](https://github.com/Wora-Ben/chromafix/security/advisories/new)
and open a draft advisory. This keeps the report confidential until a fix is
released.

Please include:

- A description of the issue and its impact.
- Steps to reproduce, or a minimal proof of concept.
- Affected version(s).

You can expect an initial response within **7 days**. Once the report is
confirmed, we will work on a fix, publish a patched release, and credit you in
the advisory unless you prefer to remain anonymous.

## Scope

chromafix runs entirely in the browser, ships no runtime dependencies, and makes
no network requests. The most relevant concerns are DOM/CSS injection through the
values you pass in (`tokens`, `labels`, `storageKey`). Reports demonstrating how
untrusted input could lead to unexpected DOM behavior are especially welcome.
