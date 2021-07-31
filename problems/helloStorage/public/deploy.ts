import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';
import setting from '../setting.json';
import Web3 from 'web3';
import BN from 'bn.js';

const web3 = new Web3();
const abi = require('ethereumjs-abi');

const input = (findFileContent: any): any => {
    return {
        language: 'Solidity',
        sources: {
            //  public/<FILE_NAME>.sol
            'public/Token.sol': {
                content: findFileContent('public/Token.sol')
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }
}


/**
 * 
 * @param deployer 
 * @param version 
 * @param valueEth 
 * @returns address of Setup contract
 */
export const deploy = async (deployer: Sender): Promise<string> => {
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return 'fail';
    }

    const bytecode = output['contracts']['public/Token.sol']['Token'].evm.bytecode.object;
    const contractAddress = await deployer.deployContract(bytecode, setting.problem.deploy_value);
    console.log('public/Token.sol', contractAddress);

    {
        const minted = '0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf';
        const data = abi.simpleEncode('mint(address,uint)', minted, new BN(10));
        const res = await deployer.callContract(contractAddress, data);
        console.log(res);
    }
    return contractAddress;
}