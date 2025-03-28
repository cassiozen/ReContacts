# ReContacts

Contacts that scale

## Stack & Dependencies

- **Runtime**: Node.js active version (22.14+), [pnpm](https://pnpm.io/installation)
- **Frontend**: Next.js with React Server Components
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Vitest with React Testing Library

## Architecture & Scalability

### Frontend

- Server Components for user experience
- Server Actions for data operations
- Sortable table with virtual scrolling for rendering large datasets on the client

### Database Optimizations

- Indexed columns (first_name, last_name) for fast sorting and lookups
- Prepared statements for repeating operations

### CSV Importing

- Column auto-mapping with manual override
- Stream-based processing to minimize memory usage
- Background queuing to handle large files without blocking
- Notification system for import status tracking

### Trade-offs

For this code challenge, I prioritized showcasing a proper architecture while keeping it easy to setup & run (No extra dependencies other than node and Postgres.). - the trade-offs include:

- **Queue System**: Currently uses in-memory queues for simplicity, but would use Redis or RabbitMQ for production to ensure persistence and scalability.
- **File Processing**: CSV files are kept in memory while processing/waiting for processing. Storing in temporary folder/object storage would be the next step for handling more simultaneous users and particularly large files
- **Monitoring**: For production, I would add detailed logging, metrics collection, and alerting
- **Database Scaling**: Would consider read replicas and connection pooling for high-traffic scenarios
- **Rate Limiting**: Would implement rate limiting for CSV uploads to prevent abuse
- **Validation**: Would add more comprehensive data validation for imported CSV records

## Local Development

1. Create a Postgres database
2. Set up `.env.local` with required variables
3. Run migrations: `pnpm db:migrate`
4. Optional: Seed database: `pnpm db:seed`
5. Start development: `pnpm dev`

## Testing

Run `pnpm test` for UI component tests and CSV import integration tests.

