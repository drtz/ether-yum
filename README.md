# ether-yum-api

A simple GraphQL API providing ethereum blockchain data in an easily-to-digest form

## Dependencies

This project uses the Infura Mainnet API. To run, you'll need to set up a free Infura project and grab a project ID and project secret at https://infura.io/

- Node 17
- npm
- Infura API project

## Building

```bash
$ npm install
```

## Running

```bash
$ INFURA_PROJECT_ID=<infura project id> \
  INFURA_PROJECT_SECRET=<infura project secret> \
  node src/index.ts

🚀 Server ready at http://localhost:4000/
```

## Making a Query

```bash
$ curl --request POST \
  --url http://localhost:4000/ \
  --header 'Content-Type: application/json' \
  --data '{"query":"query {\n\tcontract(address: \"0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d\") {\n\t\tcreatedInTransaction {\n\t\t\ttimestamp\n\t\t}\n\t}\n}\t"}'
```