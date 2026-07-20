import type { FeatureModule } from "../core/types.js";

export const docker: FeatureModule = {
  id: "docker",
  title: "Dockerfile",
  hint: "multi-stage build, non-root runtime user",
  // Only the long-running surfaces are worth containerising; a library or a
  // CLI is consumed as a package, not deployed as an image.
  appliesTo: ["api", "mcp"],

  files: (ctx) => [
    {
      path: "Dockerfile",
      contents: `FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
`,
    },
    {
      path: ".dockerignore",
      contents: `node_modules
dist
.git
*.log
.env
`,
    },
    {
      path: "docker-compose.yml",
      contents: `services:
  ${ctx.pkgName.replace(/^@[^/]+\//, "")}:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`,
    },
  ],
};
