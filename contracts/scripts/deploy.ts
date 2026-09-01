import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const eventName = "PMP Live: Manila Night";
  const ticketPriceEth = "0.01"; // price per ticket, in ETH
  const maxTickets = 100;

  const ticketPrice = ethers.parseEther(ticketPriceEth);

  console.log(`Deploying EventTicket for "${eventName}"...`);
  console.log(`Ticket price: ${ticketPriceEth} ETH, Max tickets: ${maxTickets}`);

  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy(eventName, ticketPrice, maxTickets);

  await eventTicket.waitForDeployment();

  const address = await eventTicket.getAddress();
  console.log(`✅ EventTicket deployed to: ${address}`);
  console.log(`   Organizer (deployer) address: ${await eventTicket.organizer()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});