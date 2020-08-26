import { Constructor, TinlakeParams, PendingTransaction } from '../Tinlake';
import BN from 'bn.js';
export declare function CurrencyActions<ActionsBase extends Constructor<TinlakeParams>>(Base: ActionsBase): {
    new (...args: any[]): {
        mintCurrency: (usr: string, amount: string) => Promise<unknown>;
        getCurrencyAllowance: (owner: string, spender: string) => Promise<any>;
        getJuniorForCurrencyAllowance: (owner: string) => Promise<any>;
        getSeniorForCurrencyAllowance: (owner: string) => Promise<any>;
        getCurrencyBalance: (user: string) => Promise<BN>;
        approveCurrency: (usr: string, currencyAmount: string) => Promise<{
            hash: any;
            contractKey: string;
        }>;
        approveSeniorForCurrency: (currencyAmount: string) => Promise<{
            hash: any;
            contractKey: string;
        } | undefined>;
        approveJuniorForCurrency: (currencyAmount: string) => Promise<{
            hash: any;
            contractKey: string;
        } | undefined>;
        provider: any;
        eth: import("../services/ethereum").ethI;
        ethOptions: any;
        ethConfig: import("../Tinlake").EthConfig;
        ethersConfig: import("../Tinlake").EthersConfig;
        contractAddresses: import("../Tinlake").ContractAddresses;
        transactionTimeout: number;
        contracts: import("../Tinlake").Contracts;
        ethersContracts: import("../Tinlake").Contracts;
        contractAbis: import("../Tinlake").ContractAbis;
        contractConfig: any;
        setProvider: (provider: any, ethOptions?: any) => void;
        setContracts: () => void;
        setEthConfig: (ethConfig: import("../Tinlake").EthConfig) => void;
        setEthersConfig: (ethersConfig: import("../Tinlake").EthersConfig | undefined) => void;
        createEthContract(address: string, abiName: "TINLAKE_CURRENCY" | "JUNIOR_OPERATOR" | "JUNIOR" | "JUNIOR_TOKEN" | "SENIOR" | "SENIOR_TOKEN" | "SENIOR_OPERATOR" | "DISTRIBUTOR" | "ASSESSOR" | "TITLE" | "PILE" | "SHELF" | "CEILING" | "COLLECTOR" | "THRESHOLD" | "PRICE_POOL" | "COLLATERAL_NFT" | "COLLATERAL_NFT_DATA" | "ROOT_CONTRACT" | "PROXY" | "PROXY_REGISTRY" | "ACTIONS" | "BORROWER_DEPLOYER" | "LENDER_DEPLOYER" | "NFT_FEED" | "GOVERNANCE" | "ALLOWANCE_OPERATOR"): void;
        createContract(address: string, abiName: "TINLAKE_CURRENCY" | "JUNIOR_OPERATOR" | "JUNIOR" | "JUNIOR_TOKEN" | "SENIOR" | "SENIOR_TOKEN" | "SENIOR_OPERATOR" | "DISTRIBUTOR" | "ASSESSOR" | "TITLE" | "PILE" | "SHELF" | "CEILING" | "COLLECTOR" | "THRESHOLD" | "PRICE_POOL" | "COLLATERAL_NFT" | "COLLATERAL_NFT_DATA" | "ROOT_CONTRACT" | "PROXY" | "PROXY_REGISTRY" | "ACTIONS" | "BORROWER_DEPLOYER" | "LENDER_DEPLOYER" | "NFT_FEED" | "GOVERNANCE" | "ALLOWANCE_OPERATOR"): import("ethers").Contract;
        contract(abiName: "TINLAKE_CURRENCY" | "JUNIOR_OPERATOR" | "JUNIOR" | "JUNIOR_TOKEN" | "SENIOR" | "SENIOR_TOKEN" | "SENIOR_OPERATOR" | "DISTRIBUTOR" | "ASSESSOR" | "TITLE" | "PILE" | "SHELF" | "CEILING" | "COLLECTOR" | "THRESHOLD" | "PRICE_POOL" | "COLLATERAL_NFT" | "COLLATERAL_NFT_DATA" | "ROOT_CONTRACT" | "PROXY" | "PROXY_REGISTRY" | "ACTIONS" | "BORROWER_DEPLOYER" | "LENDER_DEPLOYER" | "NFT_FEED" | "GOVERNANCE" | "ALLOWANCE_OPERATOR", address?: string | undefined): import("ethers").Contract;
        pending(txPromise: Promise<import("ethers/providers").TransactionResponse>): Promise<PendingTransaction>;
        getTransactionReceipt(tx: PendingTransaction): Promise<import("ethers/providers").TransactionReceipt>;
        getOperatorType: (tranche: string) => any;
    };
} & ActionsBase;
export declare type ICurrencyActions = {
    mintCurrency(usr: string, amount: string): Promise<unknown>;
    getCurrencyBalance(usr: string): Promise<BN>;
    getCurrencyAllowance: (owner: string, spender: string) => Promise<BN>;
    getJuniorForCurrencyAllowance: (owner: string) => Promise<BN | undefined>;
    getSeniorForCurrencyAllowance: (owner: string) => Promise<BN | undefined>;
    approveCurrency(usr: string, amount: string): Promise<PendingTransaction>;
    approveSeniorForCurrency: (currencyAmount: string) => Promise<PendingTransaction | undefined>;
    approveJuniorForCurrency: (currencyAmount: string) => Promise<PendingTransaction | undefined>;
};
export default CurrencyActions;
