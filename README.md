# Contacts

## Dependencies

- nodeJS 22.8
- [pnpm](https://pnpm.io/installation) 
- Postgres

## Tech Stack

- NextJS (React server components) + Drizzle ORM (with Postgres)

### Local Development

- Create a postgres database
- Fill the env variable (see .env.example)
- run database migrations (`pnpm db:migrate`)
- (optional) run database seed (`pnpm db:seed`)
- `pnpm dev`

