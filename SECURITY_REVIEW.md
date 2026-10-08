# Release security review

Reviewed for the 1.9.0 release.

## Attack-surface review

| Area | Release state |
|---|---|
| Remote scripts / CDNs | None |
| Analytics / tracking | None |
| Embedded payment widgets | None |
| iframes / object embeds | None |
| WebSocket / EventSource | None |
| Dynamic code execution (`eval`, `Function`) | None |
| Dynamic HTML injection in release UI | Removed from release paths |
| Network POST | Disabled unless a same-origin feedback endpoint is explicitly configured |
| Local game files | Browser-local processing; no upload path in the application |
| Project JSON | File-size and structural validation before reconstruction |
| CSP | Restrictive browser CSP included; hardened server-header examples included |
| External navigation | HTTPS-only, `noopener`, `noreferrer`, no referrer |
| Development benchmark hook | Removed from release |
| Public secrets | None; release config is explicitly public-only |

## Parser review

The binary parsers use bounds/count checks for strings, page counts, texture counts, tile-definition counts, map dimensions, and chunk tables. Malformed local files are treated as parsing errors rather than executable content.

A deliberately huge or adversarial local media folder can still consume substantial browser memory/CPU because the purpose of the application is to parse large local game assets. The release adds a folder file-count cap, but resource exhaustion from large user-selected local files remains a residual local-only risk.

## Hosting review

The safest supported public deployment is static HTTPS hosting with no writable backend. The supplied Nginx and Caddy examples deny non-GET/HEAD methods for the static site and add restrictive security headers.

Adding a feedback API increases attack surface and requires its own server-side security review. External feedback pages are therefore recommended for home-hosted deployments.

## Residual risks

- Browser / WebGL implementation vulnerabilities are outside the application's control; keep browsers and the host OS patched.
- Router, reverse-proxy, TLS, container, and operating-system configuration are outside the static application's control.
- Any future third-party scripts, widgets, analytics, or backend APIs must be reviewed separately and may require CSP changes.
- No system can be guaranteed completely secure when exposed to the public internet.
