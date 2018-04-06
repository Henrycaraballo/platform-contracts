const moment = require("moment");
const networks = require("../truffle.js").networks;

export function getDeployerAccount(network, accounts) {
  const netDefinitions = networks[network];
  return netDefinitions["from"] || accounts[0];
}

export function getConfig(web3, network, accounts) {
  const Q18 = web3.toBigNumber("10").pow(18);

  // specifies smart contracts parameters and addresses to be deployed on live network
  // DO NOT EDIT THESE VALUES
  // EDIT BELOW
  const config = {
    Q18: Q18,
    // ICBMLockedAccount
    LOCK_DURATION: 18 * 30 * 24 * 60 * 60,
    PENALTY_FRACTION: web3.toBigNumber("0.1").mul(Q18),
    // Commitment
    START_DATE: moment("2017-11-12T11:00:00.000Z").valueOf() / 1000,
    CAP_EUR: web3.toBigNumber("200000000").mul(Q18),
    MIN_TICKET_EUR: web3.toBigNumber("290").mul(Q18),
    ETH_EUR_FRACTION: web3.toBigNumber("290").mul(Q18),
    // Agreements
    RESERVATION_AGREEMENT: "ipfs:QmbH7mtyWpwTxigGtvnbYJAJ9ZZPe1FDxr9hTc2mNwpRe2", // attached to Commitment
    NEUMARK_HOLDER_AGREEMENT: "ipfs:QmVQfuibCipv9j6v4cSYTnvkjoBnx3DqSLNY3PKg8MZbP4", // attached to Neumark
    addresses: {
      // Maps roles to addresses
      ACCESS_CONTROLLER: "0x8AD8B24594ef90c15B2bd05edE0c67509c036B29",
      LOCKED_ACCOUNT_ADMIN: "0x94c32ab2c5d946aCA3aEbb543b46948d5ad0B622",
      WHITELIST_ADMIN: "0x7F5552B918a6FfC97c1705852029Fb40380aA399",
      PLATFORM_OPERATOR_WALLET: "0xA826813D0eb5D629E959c02b8f7a3d0f53066Ce4",
      PLATFORM_OPERATOR_REPRESENTATIVE: "0x83CBaB70Bc1d4e08997e5e00F2A3f1bCE225811F",
      EURT_DEPOSIT_MANAGER: "0x30A72cD2F5AEDCd86c7f199E0500235674a08E27",
    },
    artifacts: {
      ROLE_BASED_ACCESS_POLICY: "RoleBasedAccessPolicy",
      ETHEREUM_FORK_ARBITER: "EthereumForkArbiter",
      NEUMARK: "Neumark",
      ICBM_LOCKED_ACCOUNT: "ICBMLockedAccount",
      ICBM_ETHER_TOKEN: "ICBMEtherToken",
      ICBM_EURO_TOKEN: "ICBMEuroToken",
      ICBM_COMMITMENT: "ICBMCommitment",
      UNIVERSE: "Universe",
      LOCKED_ACCOUNT: "LockedAccount",
      ETHER_TOKEN: "EtherToken",
      EURO_TOKEN: "EuroToken",
      EURO_TOKEN_CONTROLLER: "EuroTokenController",
      IDENTITY_REGISTRY: "IdentityRegistry",
      SIMPLE_EXCHANGE: "SimpleExchange",
    },
    shouldSkipDeployment: network.endsWith("_test") || network === "coverage",
    isLiveDeployment: network.endsWith("_live"),
  };

  // modify live configuration according to network type
  if (!config.isLiveDeployment) {
    // start ICO in one day
    const now = Math.floor(new Date().getTime() / 1000);
    // give 5 minutes for deployment - Commitment deployment will fail if less than 24h from beginning
    config.START_DATE = now + 1 * 24 * 60 * 60 + 5 * 60;
  }

  // assign addresses to roles according to network type
  const roleMapping = config.addresses;
  // override artifacts according to network type
  const artifactMapping = config.artifacts;
  if (network === "simulated_live") {
    // on simulated live network, map roles to different accounts, skip deployer (accounts[0])
    roleMapping.ACCESS_CONTROLLER = accounts[1];
    roleMapping.LOCKED_ACCOUNT_ADMIN = accounts[2];
    roleMapping.WHITELIST_ADMIN = accounts[3];
    roleMapping.PLATFORM_OPERATOR_WALLET = accounts[4];
    roleMapping.PLATFORM_OPERATOR_REPRESENTATIVE = accounts[5];
    roleMapping.EURT_DEPOSIT_MANAGER = accounts[6];
  }
  if (!config.isLiveDeployment) {
    // on all test network, map all roles to deployer
    const DEPLOYER = getDeployerAccount(network, accounts);
    roleMapping.ACCESS_CONTROLLER = DEPLOYER;
    roleMapping.LOCKED_ACCOUNT_ADMIN = DEPLOYER;
    roleMapping.WHITELIST_ADMIN = DEPLOYER;
    roleMapping.PLATFORM_OPERATOR_WALLET = DEPLOYER;
    roleMapping.PLATFORM_OPERATOR_REPRESENTATIVE = DEPLOYER;
    roleMapping.EURT_DEPOSIT_MANAGER = DEPLOYER;

    // use mocked artifacts when necessary
    // artifactMapping.ICBM_EURO_TOKEN = "MockedICBMEuroToken";
    artifactMapping.ICBM_COMMITMENT = "MockICBMCommitment";
  }

  return config;
}
