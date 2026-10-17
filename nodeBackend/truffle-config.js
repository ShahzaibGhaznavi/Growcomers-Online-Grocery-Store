module.exports = {
  contracts_directory: "./blockchain/contracts",
  contracts_build_directory: "./blockchain/build",
  migrations_directory: "./blockchain/migrations",
  networks: {
    development: {
      host: process.env.GANACHE_HOST || "127.0.0.1",
      port: Number(process.env.GANACHE_PORT || 8545),
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.4",
    },
  },
  db: {
    enabled: false,
  },
};