import { ethers } from 'hardhat';
import {SimpleContract__factory} from "../typechain-types";

const getValue = async (contractAddress:string) =>{

    const simpleContract = SimpleContract__factory.connect(contractAddress, ethers.provider);

    const value = await simpleContract.getValue();

    console.log(`The value of the contract is ${value}`);
}

getValue('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');