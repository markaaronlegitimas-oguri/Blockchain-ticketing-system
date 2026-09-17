const { ethers } = require('ethers');
require('dotenv').config();
const contractJson = require('./EventTicket.json');

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractJson.abi,
  wallet
);

module.exports = contract;