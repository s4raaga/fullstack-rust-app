# Build Stage
FROM rust:latest AS builder

WORKDIR /app

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL

COPY . .

RUN cargo build --release 

# Production stage 
FROM debian:bookworm-slim

WORKDIR /user/local/bin

COPY --from=builder /app/target/release/fullstack-web-app .

CMD ["./fullstack-web-app"]