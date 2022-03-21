# ether-yum-api

A simple GraphQL API providing ethereum blockchain data in an easily-to-digest form

## Dependencies

This project uses the Infura Mainnet API. To run, you'll need to set up a free Infura project and grab a project ID and project secret at https://infura.io/

## Building

```bash
> npm install
```

## Running

```bash
$ INFURA_PROJECT_ID=<infura project id> \
  INFURA_PROJECT_SECRET=<infura project secret> \
  node src/index.ts

🚀 Server ready at http://localhost:4000/
```