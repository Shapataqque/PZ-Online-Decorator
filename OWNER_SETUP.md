# Site owner setup

## Feedback

The release works without a backend. The Feedback dialog can operate in three modes.

### Safest / simplest: external feedback page

Set `feedbackUrl` in `config/release-config.js` to an HTTPS page such as a GitHub Issues form:

```js
feedbackUrl: "https://github.com/YOUR_ACCOUNT/YOUR_REPO/issues/new"
```

When the user submits feedback, the application copies the formatted report to the clipboard and opens that page. The user pastes the report there. Your home server remains static and exposes no write endpoint.

### Same-origin feedback endpoint

If you later add a server-side endpoint, configure only a relative same-origin path:

```js
feedbackEndpoint: "/api/feedback"
```

The browser sends JSON containing only the fields shown in the Feedback dialog. The frontend intentionally rejects absolute feedback-endpoint URLs.

If you build this endpoint, enforce server-side rate limiting, a strict request-size cap, JSON schema validation, output escaping in any admin UI, CSRF-independent authentication for admin pages, and never execute or interpolate submitted text into shell commands, SQL, HTML, or templates without correct escaping/parameterization.

The supplied static Nginx/Caddy examples intentionally reject POST requests. If you add `/api/feedback`, create one dedicated reverse-proxy route for that exact path; do not relax the write-method restriction for the rest of the site.

## Support / Buy Me a Coffee

Create your support page and set the HTTPS URL:

```js
supportUrl: "https://buymeacoffee.com/YOUR_NAME"
```

The Support button then appears automatically. The application opens the URL in a new tab with `noopener`, `noreferrer`, and no embedded third-party widget. This is intentionally safer and more private than injecting a third-party payment script into the application.

## Important

`config/release-config.js` is downloaded by every visitor. It must contain public URLs only. Never place an API key, webhook secret, database password, SMTP password, private GitHub token, or payment credential there.
