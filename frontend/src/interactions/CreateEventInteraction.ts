import { ethers } from 'ethers';

export const createEvent = async (
    contract: ethers.Contract,
    name: string,
    date: number,
    price: number,
    tickets: number
): Promise<ethers.ContractTransaction> => {
    try {
        const tx = await contract.createEvent(
            name,
            date,
            price,
            tickets
        );

        return tx;
    } catch (error) {
        console.error("CreateEventInteraction error:", error);
        throw error;
    }
};