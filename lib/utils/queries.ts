import { gql } from 'graphql-request';

// All Coins (filtered by MarketCap)
// Make sure to change the 'creator' address to the Off-Chain Address
export const ALL_COLLECTIONS_QUERY_BY_MARKETCAP = gql`
query getAllCollectionTokens {
  collectionTokens(
    where: { collection_: {manager: "0x3119C7b33e29243B14b7E465102b10875B21c212"}}
  ) {
    baseURI
    createdAt
    volumeETH
    marketCapETH
    metadata {
      description
      name
      symbol
    }
    id
  }
}
`;

// All Coins filtered by date created
// Make sure to change the 'creator' address to the Off-Chain Address
export const ALL_COLLECTIONS_QUERY_BY_DATE_CREATED = gql`
query getAllCollectionTokens {
    collectionTokens(
        first: 10
        orderBy: createdAt
        orderDirection: asc
        where: {creator: "0xf1a700000087c011413c21c9b357a6962aa256f9"}
      ) {
        baseURI
        collection {
          contract
          tokenID
        }
        createdAt
        creator {
          id
        }
        tokenPrice
        volumeETH
        marketCapETH
        metadata {
          description
          name
          symbol
        }
     }
  }
`;

//Singular Coin details
export const SINGLE_COIN_QUERY = gql`
query getCollectionToken($id: String!) {
    collectionToken(id: $id) {
        baseURI
        createdAt
        marketCapETH
        tokenPrice
        volumeETH
        totalHolders
        id
        metadata {
          description
          discord
          name
          symbol
          twitter
          website
        }
      }
  }
`;

//Singular Coin Volume details
export const SINGLE_COIN_VOLUME_QUERY = gql`
query getCollectionToken($id: String!) {
    collectionToken(id: $id) {
        volumeETH
      }
  }
`;
