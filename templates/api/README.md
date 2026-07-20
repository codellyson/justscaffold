# __PKG_NAME__

__PKG_DESCRIPTION__

A Hono HTTP service running on Node.

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check. |
| `GET` | `/api/items` | Example resource. |

## Develop

```sh
npm install
npm run dev
```

## Configuration

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `NODE_ENV` | `development` |
