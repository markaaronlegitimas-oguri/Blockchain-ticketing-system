import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const [organizer, buyer1, buyer2] = await ethers.getSigners();

  console.log("=== Setup ===");
  console.log("Organizer:", organizer.address);
  console.log("Buyer 1:  ", buyer1.address);
  console.log("Buyer 2:  ", buyer2.address);

  const ticketPrice = ethers.parseEther("0.01");
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy("PMP Live: Manila Night", ticketPrice, 100);
  await eventTicket.waitForDeployment();
  console.log("\nContract deployed to:", await eventTicket.getAddress());

  console.log("\n=== 1. Issue tickets ===");
  const issueTx = await eventTicket.connect(organizer).issueTickets(5);
  await issueTx.wait();
  console.log("Issued 5 tickets. Total issued:", await eventTicket.ticketsIssued());

  console.log("\n=== 2. Buyer 1 purchases ticket #0 ===");
  const purchaseTx = await eventTicket.connect(buyer1).purchaseTicket(0, { value: ticketPrice });
  await purchaseTx.wait();
  let ticket = await eventTicket.getTicket(0);
  console.log("Ticket 0 owner:", ticket.owner, "| status:", ticket.status.toString());

  console.log("\n=== 3. Buyer 1 transfers ticket #0 to Buyer 2 ===");
  const transferTx = await eventTicket.connect(buyer1).transferTicket(0, buyer2.address);
  await transferTx.wait();
  ticket = await eventTicket.getTicket(0);
  console.log("Ticket 0 new owner:", ticket.owner, "| status:", ticket.status.toString());

  console.log("\n=== 4. Organizer validates ticket #0 at the gate ===");
  const validateTx = await eventTicket.connect(organizer).validateTicket(0);
  await validateTx.wait();
  ticket = await eventTicket.getTicket(0);
  console.log("Ticket 0 status after validation:", ticket.status.toString(), "(2 = Used)");

  console.log("\n=== 5. Confirm a used ticket can't be validated twice ===");
  try {
    await eventTicket.connect(organizer).validateTicket(0);
    console.log("❌ ERROR: this should have failed but did not");
  } catch (err) {
    console.log("✅ Correctly rejected re-validation");
  }

  console.log("\n=== 6. Buyer 2 cancels ticket #0 (should fail, already used) ===");
  try {
    await eventTicket.connect(buyer2).cancelTicket(0);
    console.log("❌ ERROR: this should have failed but did not");
  } catch (err) {
    console.log("✅ Correctly rejected cancelling a used ticket");
  }

  console.log("\n=== 7. Buyer 1 purchases and cancels ticket #1 (refund test) ===");
  const balBefore = await ethers.provider.getBalance(buyer1.address);
  const buyTx1 = await eventTicket.connect(buyer1).purchaseTicket(1, { value: ticketPrice });
  await buyTx1.wait();

  await eventTicket.connect(organizer).fundForRefunds({ value: ticketPrice });

  const cancelTx = await eventTicket.connect(buyer1).cancelTicket(1);
  await cancelTx.wait();
  const balAfter = await ethers.provider.getBalance(buyer1.address);
  console.log("Buyer 1 balance before purchase+cancel cycle:", ethers.formatEther(balBefore));
  console.log("Buyer 1 balance after purchase+cancel cycle: ", ethers.formatEther(balAfter));
  console.log("(Small difference is expected gas cost — refund of ticket price was received)");

  console.log("\n✅ All lifecycle tests completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});