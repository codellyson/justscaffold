# __PKG_NAME__

__PKG_DESCRIPTION__

An MCP server speaking stdio.

## Tools

| Tool | Description |
| --- | --- |
| `ping` | Echo a message back; use it to confirm the server is wired up. |
| `fetch_item` | Fetch a single item by id from the configured API. |

## Configuration

All configuration is environment variables — there are no flags.

| Variable | Required | Default |
| --- | --- | --- |
| `__CONST_NAME___API_URL` | no | `https://example.com` |
| `__CONST_NAME___TOKEN` | no | — |

## Develop

```sh
npm install
npm run dev
```

Logs go to stderr on purpose: stdout carries the MCP protocol stream, and
writing anything else to it will break the client connection.
