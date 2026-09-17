// buyTicket.js
// Simulates a real buyer purchasing a ticket by calling purchaseTicket()
// directly on the deployed EventTicket contract, signed by a TEST buyer
// wallet (never the backend/organizer wallet).
//
// Run from your backend/ folder: node buyTicket.js <ticketId>
// Example:                        node buyTicket.js 1

require('dotenv').config();
const { ethers } = require('ethers');

const contractArtifact = require('./EventTicket.json');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const BUYER_PRIVATE_KEY = process.env.BUYER_TEST_PRIVATE_KEY;

async function main() {
  const ticketId = process.argv[2];
  if (!ticketId) {
    console.error('Usage: node buyTicket.js <ticketId>');
    process.exit(1);
  }

  if (!RPC_URL || !BUYER_PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error('Missing SEPOLIA_RPC_URL, BUYER_TEST_PRIVATE_KEY, or CONTRACT_ADDRESS in .env');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const buyerWallet = new ethers.Wallet(BUYER_PRIVATE_KEY, provider);

  console.log('Buyer address:', buyerWallet.address);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    buyerWallet
  );

  const ticketPrice = await contract.ticketPrice();
  console.log('Ticket price (wei):', ticketPrice.toString());

  console.log(`Purchasing ticket #${ticketId}...`);
  const tx = await contract.purchaseTicket(ticketId, {
    value: ticketPrice,
  });

  console.log('Transaction sent. Hash:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
  console.log('\nTx hash to use with /api/tickets/verify-purchase:');
  console.log(tx.hash);
}

main().catch((err) => {
  console.error('Purchase failed:', err.reason || err.message || err);
  process.exit(1);
});