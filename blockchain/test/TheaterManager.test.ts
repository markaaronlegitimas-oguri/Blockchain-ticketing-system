import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers, BigNumber } from "hardhat";

describe("TheaterManager", function () {
  let theater: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const TheaterManager = await ethers.getContractFactory("TheaterManager");
    theater = await TheaterManager.deploy();
  });

  it("should set the deployer as the owner", async () => {
    expect(await theater.owner()).to.equal(owner.address);
  });

  it("should allow the owner to create an event", async () => {
    await expect(
      theater.createEvent("Concert", 1234567890, 1, 10) // price in ether
    )
      .to.emit(theater, "EventCreated")
      .withArgs(0, "Concert", 1234567890, ethers.parseEther("1"), 10);

    const event = await theater.events(0);
    expect(event.name).to.equal("Concert");
  });

  it("should prevent non-owners from creating events", async () => {
    await expect(
      theater.connect(user1).createEvent("Unauthorized", 111, 1, 1)
    ).to.be.revertedWith("You are not allowed here!");
  });

  it("should allow a user to purchase a ticket", async () => {
    await theater.createEvent("Play", 1234, 1, 5);

    await expect(
      theater.connect(user1).purchaseTicket(0, {
        value: ethers.parseEther("1"),
      })
    )
      .to.emit(theater, "TicketPurchased")
      .withArgs(0, 0, user1.address);

    const ticket = await theater.tickets(0);
    expect(ticket.owner).to.equal(user1.address);
  });

  it("should reject underpayment when purchasing a ticket", async () => {
    await theater.createEvent("Play", 1234, 2, 5);

    await expect(
      theater.connect(user1).purchaseTicket(0, {
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("Incorrect ticket price");
  });

  it("should reject ticket purchase if event is inactive", async () => {
    await theater.createEvent("Cancelled", 9999, 1, 2);
    await theater.cancelEvent(0);

    await expect(
      theater.connect(user1).purchaseTicket(0, {
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("Event not available");
  });

  it("should allow a user to transfer a ticket", async () => {
    await theater.createEvent("Opera", 1234, 1, 1);
    await theater.connect(user1).purchaseTicket(0, {
      value: ethers.parseEther("1"),
    });

    await expect(theater.connect(user1).transferTicket(0, user2.address))
      .to.emit(theater, "TicketTransferred")
      .withArgs(0, user2.address);

    const updated = await theater.tickets(0);
    expect(updated.owner).to.equal(user2.address);
  });

  it("should allow the owner to verify a valid ticket", async () => {
    await theater.createEvent("Show", 1234, 1, 1);
    await theater.connect(user1).purchaseTicket(0, {
      value: ethers.parseEther("1"),
    });

    const valid = await theater.verifyTicket(0);
    expect(valid).to.be.true;
  });

  it("should refund ticket holders on event cancellation", async () => {
    await theater.createEvent("Refundable", 1234, 1, 2);

    await theater.connect(user1).purchaseTicket(0, {
      value: ethers.parseEther("1"),
    });

    const balanceBefore = await ethers.provider.getBalance(user1.address);
    const tx = await theater.cancelEvent(0);
    const receipt = await tx.wait();

    // Use bigint directly from the receipt
    const gasUsed = receipt.gasUsed || 0n;
    const effectiveGasPrice = receipt.effectiveGasPrice || 0n;
    const gasCost = gasUsed * effectiveGasPrice;

    const balanceAfter = await ethers.provider.getBalance(user1.address);

    // Use native bigint comparison (Chai supports bigint in recent versions)
    expect(balanceAfter).to.be.greaterThan(balanceBefore - gasCost);

    const ticket = await theater.tickets(0);
    expect(ticket.valid).to.be.false;
  });
  it("should return user's tickets correctly", async () => {
    await theater.createEvent("Festival", 1234, 1, 5);
    await theater.connect(user1).purchaseTicket(0, {
      value: ethers.parseEther("1"),
    });

    const userTickets = await theater.getUserTickets(user1.address);
    expect(userTickets.length).to.equal(1);
    expect(userTickets[0]).to.equal(0);
  });
});
