import { DisplayField } from '@centrifuge/axis-display-field'
import { baseToDisplay, feeToInterestRate } from '@centrifuge/tinlake-js'
import BN from 'bn.js'
import { Table, TableBody, TableCell, TableRow } from 'grommet'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Pool } from '../../../config'
import { createTransaction, TransactionProps } from '../../../ducks/transactions'
import { addThousandsSeparators } from '../../../utils/addThousandsSeparators'
import { dateToYMD } from '../../../utils/date'
import { getAddressLink } from '../../../utils/etherscanLinkGenerator'
import { toPrecision } from '../../../utils/toPrecision'
import { Asset } from '../../../utils/useAsset'
import { Button } from '../../Button'
import { ButtonGroup } from '../../ButtonGroup'
import { Card } from '../../Card'
import { useDebugFlags } from '../../DebugFlags'
import { Divider } from '../../Divider'
import { SectionHeading } from '../../Heading'
import { Box, Flex, Shelf, Stack } from '../../Layout'
import { LoadingValue } from '../../LoadingValue'
import { useTinlake } from '../../TinlakeProvider'
import LoanLabel from '../Label'

interface Props extends TransactionProps {
  loan?: Asset
  poolConfig: Pool
}

const DisplayFieldWrapper = styled.div`
  width: 100%;
  max-width: 200px;
  > div {
    padding: 0;
  }
`

const LoanData: React.FC<Props> = (props: Props) => {
  const tinlake = useTinlake()
  const { showTransferCurrency } = useDebugFlags()
  const availableForFinancing = props.loan?.debt.isZero() ? props.loan?.principal || new BN(0) : new BN(0)

  const proxyTransfer = async () => {
    if (!props.loan?.borrower) throw new Error('Borrower field missing')

    await props.createTransaction(`Transfer currency from proxy`, 'proxyTransferCurrency', [
      tinlake,
      props.loan.ownerOf,
      props.loan.borrower,
    ])
  }

  return (
    <Stack as={Card} gap="medium" p="medium" maxWidth={{ medium: 900 }}>
      <Shelf justifyContent={['space-between', 'flex-start']} gap="small">
        <SectionHeading>Status</SectionHeading>
        <LoadingValue done={!!props.loan} height={28} alignRight={false}>
          {props.loan && <LoanLabel loan={props.loan} />}
        </LoadingValue>
      </Shelf>
      <Flex flexDirection={['column', 'column', 'row']} justifyContent="space-between">
        <Box maxWidth={{ medium: 360 }} flex="1">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell scope="row">Available for Financing</TableCell>
                <TableCell style={{ textAlign: 'end' }}>
                  <LoadingValue done={props.loan?.principal !== undefined}>
                    {addThousandsSeparators(toPrecision(baseToDisplay(availableForFinancing, 18), 2))}{' '}
                    {props.poolConfig.metadata.currencySymbol || 'DAI'}
                  </LoadingValue>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">Outstanding</TableCell>
                <TableCell style={{ textAlign: 'end' }}>
                  <LoadingValue done={props.loan?.debt !== undefined}>
                    {addThousandsSeparators(toPrecision(baseToDisplay(props.loan?.debt || new BN(0), 18), 2))}{' '}
                    {props.poolConfig.metadata.currencySymbol || 'DAI'}
                  </LoadingValue>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row" border={{ color: 'transparent' }}>
                  Maturity date
                </TableCell>
                <TableCell style={{ textAlign: 'end' }} border={{ color: 'transparent' }}>
                  <LoadingValue done={props.loan?.nft?.maturityDate !== undefined}>
                    {dateToYMD(props.loan?.nft?.maturityDate || 0)}
                  </LoadingValue>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Divider display={{ medium: 'none' }} m={0} />
        <Box maxWidth={{ medium: 360 }} flex="1">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell scope="row">Risk group</TableCell>
                <TableCell style={{ textAlign: 'end' }}>
                  <LoadingValue done={props.loan?.riskGroup !== undefined}>{props.loan?.riskGroup}</LoadingValue>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">Financing fee</TableCell>
                <TableCell style={{ textAlign: 'end' }}>
                  <LoadingValue done={props.loan?.interestRate !== undefined}>
                    {toPrecision(feeToInterestRate(props.loan?.interestRate || new BN(0)), 2)} %
                  </LoadingValue>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row" border={{ color: 'transparent' }}>
                  Financed by
                </TableCell>
                <TableCell style={{ textAlign: 'end', float: 'right' }} border={{ color: 'transparent' }}>
                  <LoadingValue done={!!props.loan} height={24}>
                    {props.loan?.borrower && (
                      <DisplayFieldWrapper>
                        <DisplayField
                          copy={true}
                          as={'span'}
                          value={props.loan?.borrower}
                          link={{
                            href: getAddressLink(props.loan?.borrower),
                            target: '_blank',
                          }}
                        />
                      </DisplayFieldWrapper>
                    )}
                  </LoadingValue>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Flex>
      {props.loan?.ownerOf && props.loan?.borrower && showTransferCurrency && (
        <ButtonGroup>
          <Button label="Transfer currency from proxy" size="small" onClick={() => proxyTransfer()}></Button>
        </ButtonGroup>
      )}
    </Stack>
  )
}

export default connect(null, { createTransaction })(LoanData)
