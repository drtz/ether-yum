const { InfuraEthereumClient } = require("./infura/InfuraEthereumClient");
const { ApolloServer, gql } = require('apollo-server');
const ContractService = require('./services/ContractService');

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const baseUrl = 'https://mainnet.infura.io/v3/';
const infuraClient = new InfuraEthereumClient({ baseUrl, projectId, projectSecret });

const contractService = new ContractService({ infuraClient });

// The GraphQL schema
const typeDefs = gql`
  type TransactionInfo {
      transactionHash: String
      blockNumber: String
      blockHash: String
      timestamp: Int
  }
  type Contract {
    "Yummy info about an Ethereum contract"
    createdInTransaction: TransactionInfo
  }
  type Query {
    contract(address: String!): Contract
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    contract(_, { address }) {
        console.log('resolver', address);
        return contractService.getContractByAddress(address);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});