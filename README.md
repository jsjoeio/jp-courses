# jp-courses-install

Install script for my courses written in Deno.

## Local Development

### Testing

To run the integration tests:
```sh
cd tests
deno test --unstable --allow-net ./tests/unit.test.ts
deno test --unstable --allow-net --allow-read --allow-write ./tests/integration.test.ts
```