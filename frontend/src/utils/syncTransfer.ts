const API = import.meta.env.VITE_API_BASE_URL as string;

export interface SyncTransferResult {
  synced: boolean;
  reason?: string;
  note?: string;
}

export async function syncTransfer(
  txHash: string,
  accessToken: string,
  retries = 3
): Promise<SyncTransferResult> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`${API}/tickets/sync-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ txHash }),
    });
    const body = await res.json().catch(() => ({}));

    if (res.status === 404 && attempt < retries) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    if (res.ok || res.status === 202) return body as SyncTransferResult;
    throw new Error(body.error || `Sync failed (${res.status})`);
  }
  throw new Error('Sync failed after retries');
}