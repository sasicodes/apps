import Eth from 'ethjs'
import { ethI } from './services/ethereum'
import abiDefinitions from './abi'
import { ethers } from 'ethers'
import BN from 'bn.js'

const contractNames = [
  'TINLAKE_CURRENCY',
  'JUNIOR_OPERATOR',
  'JUNIOR',
  'JUNIOR_TOKEN',
  'SENIOR',
  'SENIOR_TOKEN',
  'SENIOR_OPERATOR',
  'DISTRIBUTOR',
  'ASSESSOR',
  'TITLE',
  'PILE',
  'SHELF',
  'CEILING',
  'COLLECTOR',
  'THRESHOLD',
  'PRICE_POOL',
  'COLLATERAL_NFT',
  'COLLATERAL_NFT_DATA',
  'ROOT_CONTRACT',
  'PROXY',
  'PROXY_REGISTRY',
  'ACTIONS',
  'BORROWER_DEPLOYER',
  'LENDER_DEPLOYER',
  'NFT_FEED',
  'GOVERNANCE',
  'ALLOWANCE_OPERATOR',
] as const

export type PendingTransaction = {
  hash?: string
  status: number
  error?: string
  timesOutAt?: number
}

export type EthConfig = {
  from?: string
  gasPrice?: string
  gas?: string
}

export type Overrides = {
  gasPrice?: number
  gasLimit?: number
}

export type EthersConfig = {
  provider: ethers.providers.Provider
  signer: ethers.Signer
}

export type ContractName = typeof contractNames[number]

export type Contracts = {
  [key in ContractName]?: any
}

export type ContractAbis = {
  [key in ContractName]?: any
}

export type ContractAddresses = {
  [key in ContractName]?: string
}

export type TinlakeParams = {
  provider: any
  transactionTimeout: number
  contractAddresses?: ContractAddresses | {}
  contractAbis?: ContractAbis | {}
  ethConfig?: EthConfig
  ethersConfig?: EthersConfig
  overrides?: Overrides
  ethOptions?: any | {}
  contracts?: Contracts | {}
  contractConfig?: any | {}
}

export type Constructor<T = {}> = new (...args: any[]) => Tinlake

ethers.errors.setLogLevel('error')

;(ethers.utils.BigNumber as any).prototype.toBN = function () {
  return new BN((this as any).toString())
}

export default class Tinlake {
  public provider: any
  public eth: ethI
  public ethOptions: any
  public ethConfig: EthConfig
  public ethersConfig: EthersConfig
  public overrides: Overrides = {}
  public contractAddresses: ContractAddresses
  public transactionTimeout: number
  public contracts: Contracts = {}
  public ethersContracts: Contracts = {}
  public contractAbis: ContractAbis = {}
  public contractConfig: any = {}

  constructor(params: TinlakeParams) {
    const {
      provider,
      contractAddresses,
      transactionTimeout,
      contractAbis,
      ethOptions,
      ethConfig,
      ethersConfig,
      overrides,
      contractConfig,
    } = params
    if (!contractAbis) {
      this.contractAbis = abiDefinitions
    }

    this.contractConfig = contractConfig || {}
    this.contractAddresses = contractAddresses || {}
    this.transactionTimeout = transactionTimeout
    this.overrides = overrides || {}
    this.setProvider(provider, ethOptions, ethersConfig)
    this.setEthConfig(ethConfig || {})
    this.setEthersConfig(ethersConfig)
  }

  setProvider = (provider: any, ethOptions?: any, ethersConfig?: EthersConfig) => {
    this.provider = provider
    this.ethOptions = ethOptions || {}
    this.eth = new Eth(this.provider, this.ethOptions) as ethI

    if (ethersConfig) this.ethersConfig = ethersConfig

    this.setContracts()
  }

  setContracts = () => {
    // set root & proxy contracts
    contractNames.forEach((name) => {
      if (this.contractAbis[name] && this.contractAddresses[name]) {
        this.contracts[name] = this.eth.contract(this.contractAbis[name]).at(this.contractAddresses[name])

        if (this.ethersConfig) this.ethersContracts[name] = this.createContract(this.contractAddresses[name]!, name)
      }
    })

    // modular contracts
    if (this.contractAddresses['JUNIOR_OPERATOR']) {
      this.contracts['JUNIOR_OPERATOR'] = this.contractConfig['JUNIOR_OPERATOR']
        ? this.createEthContract(this.contractAddresses['JUNIOR_OPERATOR'], this.contractConfig['JUNIOR_OPERATOR'])
        : this.createEthContract(this.contractAddresses['JUNIOR_OPERATOR'], 'ALLOWANCE_OPERATOR')

      this.ethersContracts['JUNIOR_OPERATOR'] = this.contractConfig['JUNIOR_OPERATOR']
        ? this.createContract(this.contractAddresses['JUNIOR_OPERATOR'], this.contractConfig['JUNIOR_OPERATOR'])
        : this.createContract(this.contractAddresses['JUNIOR_OPERATOR'], 'ALLOWANCE_OPERATOR')
    }
    if (this.contractAddresses['SENIOR_OPERATOR']) {
      this.contracts['SENIOR_OPERATOR'] = this.contractConfig['SENIOR_OPERATOR']
        ? this.createEthContract(this.contractAddresses['SENIOR_OPERATOR'], this.contractConfig['SENIOR_OPERATOR'])
        : this.createEthContract(this.contractAddresses['SENIOR_OPERATOR'], 'ALLOWANCE_OPERATOR')

      this.ethersContracts['SENIOR_OPERATOR'] = this.contractConfig['SENIOR_OPERATOR']
        ? this.createContract(this.contractAddresses['SENIOR_OPERATOR'], this.contractConfig['SENIOR_OPERATOR'])
        : this.createContract(this.contractAddresses['SENIOR_OPERATOR'], 'ALLOWANCE_OPERATOR')
    }
  }

  setEthConfig = (ethConfig: EthConfig) => {
    this.ethConfig = {
      ...this.ethConfig,
      ...ethConfig,
    }
  }

  setEthersConfig = (ethersConfig: EthersConfig | undefined) => {
    this.ethersConfig = {
      ...this.ethersConfig,
      ...ethersConfig,
    }
  }

  createEthContract(address: string, abiName: ContractName) {
    const contract = this.eth.contract(this.contractAbis[abiName]).at(address)
    return contract
  }

  createContract(address: string, abiName: ContractName) {
    return new ethers.Contract(address, this.contractAbis[abiName], this.ethersConfig.provider)
  }

  contract(abiName: ContractName, address?: string): ethers.Contract {
    if (address) {
      return new ethers.Contract(address, this.contractAbis[abiName], this.ethersConfig.signer)
    }
    if (this.ethersConfig.signer) {
      return this.ethersContracts[abiName].connect(this.ethersConfig.signer)
    }
    return this.ethersContracts[abiName]
  }

  async pending(txPromise: Promise<ethers.providers.TransactionResponse>): Promise<PendingTransaction> {
    try {
      const tx = await txPromise
      return {
        status: 1,
        hash: tx.hash,
        timesOutAt: Date.now() + this.transactionTimeout * 1000,
      }
    } catch (e) {
      console.error(`Error caught in tinlake.pending(): ${e}`)
      return {
        status: 0,
        error: e.message,
      }
    }
  }

  async getTransactionReceipt(tx: PendingTransaction): Promise<ethers.providers.TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      if (!tx.hash) return reject()

      let timer: NodeJS.Timer | undefined = undefined
      if (tx.timesOutAt) {
        timer = setTimeout(() => {
          return reject()
        }, tx.timesOutAt - Date.now())
      }

      try {
        const receipt = await this.ethersConfig.provider!.waitForTransaction(tx.hash)
        if (timer) clearTimeout(timer)

        // TODO: if receipt.status === 0, use this to get the revert reason:
        // https://gist.github.com/gluk64/fdea559472d957f1138ed93bcbc6f78a#file-reason-js

        return resolve(receipt)
      } catch (e) {
        console.error(`Error caught in tinlake.getTransactionReceipt(): ${e}`)
        return reject()
      }
    })
  }

  getOperatorType = (tranche: string) => {
    switch (tranche) {
      case 'senior':
        return this.contractConfig['SENIOR_OPERATOR'] || 'ALLOWANCE_OPERATOR'
      case 'junior':
        return this.contractConfig['SENIOR_OPERATOR'] || 'ALLOWANCE_OPERATOR'
      default:
        return 'ALLOWANCE_OPERATOR'
    }
  }
}
