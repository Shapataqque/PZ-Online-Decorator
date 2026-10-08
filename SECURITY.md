# Security

No public web service can be guaranteed “unhackable”. This release minimizes attack surface by remaining a static application by default.

## Release security properties

- No application backend is required.
- No database is required.
- The Project Zomboid media folder is read through the browser file picker and is not uploaded by the application.
- No third-party JavaScript, analytics, payment widget, iframe, CDN script, or remote font is included.
- Content Security Policy restricts executable code and network requests to the same origin.
- External Support / Feedback links are HTTPS-only and open without an opener or referrer.
- Optional direct feedback is restricted to a same-origin relative endpoint.
- JSON project loading validates file size, dimensions, layers, cells, sprite-name lengths, and total sprite count before reconstruction.
- Runtime HTML is built with DOM APIs and `textContent`; release catalogue data is not inserted as executable HTML.
- Development-only synthetic benchmark hooks are not shipped.

## Recommended home-hosting architecture

For the lowest practical risk:

1. Serve this directory as **static files only** from a dedicated machine, VM, or container. Do not serve your home directory or source-control credentials.
2. Run the web server as an unprivileged user with read-only access to the release directory.
3. Expose only HTTPS (TCP 443) to the internet. Do not expose SSH, SMB, RDP, databases, Docker APIs, router admin pages, or NAS management interfaces.
4. Use a reverse proxy such as Caddy or Nginx. Use the example configuration under `deploy/` as a baseline.
5. Keep the OS, reverse proxy, router, and TLS stack patched.
6. Disable directory listing. Permit only GET/HEAD for the static site.
7. Put the public host on an isolated VLAN / guest network / VM network when possible so compromise does not provide a path to personal devices.
8. Use a firewall on both the host and router. Default deny inbound traffic except the public HTTPS path you intentionally expose.
9. Do not run the website as root / Administrator.
10. Back up the release and configuration, but do not place private backups under the web root.
11. Monitor access/error logs and disk usage. Apply rate limits at the reverse proxy if the site becomes public.
12. Prefer an external feedback service (for example GitHub Issues) over adding a writable custom API to the home server.

## TLS and headers

Use HTTPS only. The supplied proxy examples set:

- HSTS
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- X-Frame-Options / frame-ancestors

The HTML contains a CSP as defense in depth, but server headers are preferred because some directives (notably `frame-ancestors`) only work reliably as HTTP headers.

## Feedback backend warning

Adding `/api/feedback` changes the threat model from static hosting to a writable internet-facing application. If maximum security is the priority, leave `feedbackEndpoint` blank and use `feedbackUrl` instead.

## Reporting a security issue

Do not publish passwords, private tokens, home IP credentials, router screenshots, or sensitive local paths in public issue trackers. Use a private contact channel for security-sensitive reports.
