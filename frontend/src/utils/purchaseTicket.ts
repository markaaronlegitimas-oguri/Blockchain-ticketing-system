import { ethers } from 'ethers';
import { TicketStatus } from './ticketTypes';

export interface PurchaseResult {
  txHash: string;
  ticketId: number;
}

export async function purchaseTicketOnChain(
  contract: ethers.Contract
): Promise<PurchaseResult> {
  const price: ethers.BigNumber = await contract.ticketPrice();
  const all = await contract.getAllTickets();

  const available: number[] = all
    .filter((t: any) => Number(t.status) === TicketStatus.Unsold)
    .map((t: any) => Number(t.id.toString()));

  if (available.length === 0) {
    throw new Error('Sold out: no tickets are available for purchase');
  }

  let lastError: unknown = null;
  for (const ticketId of available) {
    try {
      const tx = await contract.purchaseTicket(ticketId, { value: price });
      await tx.wait();
      return { txHash: tx.hash, ticketId };
    } catch (err: any) {
      // User rejected in MetaMask: stop immediately
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') throw err;

      // If someone else bought this ticket first, try the next one;
      // if it's still unsold, the failure had another cause (e.g. no funds)
      const t = await contract.getTicket(ticketId);
      if (Number(t.status) === TicketStatus.Unsold) throw err;
      lastError = err;
    }
  }
  throw lastError ?? new Error('Could not purchase a ticket');
}