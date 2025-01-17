import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import * as React from 'react'
import { useQuery } from 'react-query'
import { useWeb3 } from '../components/Web3Provider'
import { initPolkadotApi } from './web3'

export function useTransactionFeeEstimate(callback: (api: ApiPromise) => SubmittableExtrinsic<'promise'>) {
  const { selectedAccount } = useWeb3()
  const [key] = React.useState(() => Math.random().toString(36).substr(2))
  const query = useQuery(
    ['fee', key],
    async () => {
      const api = await initPolkadotApi()
      const submittable = callback(api)
      const feeResponse = await submittable.paymentInfo(selectedAccount!.address)
      return Number(feeResponse.partialFee.toString()) / 10 ** (api.registry.chainDecimals as any)
    },
    {
      enabled: !!selectedAccount,
      cacheTime: 0, // delete the data when unmounting
    }
  )

  return query
}
