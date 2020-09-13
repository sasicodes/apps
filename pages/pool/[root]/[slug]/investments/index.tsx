import * as React from 'react'
import InvestmentsView from '../../../../../containers/Investment/View'
import RevolvingPoolInvestmentsView from '../../../../../containers/Investment/RevolvingPool/View'
import WithTinlake from '../../../../../components/WithTinlake'
import { Box, Heading } from 'grommet'
import Header from '../../../../../components/Header'
import { menuItems } from '../../../../../menuItems'
import SecondaryHeader from '../../../../../components/SecondaryHeader'
import Auth from '../../../../../components/Auth'
import WithFooter from '../../../../../components/WithFooter'
import { WithRouterProps } from 'next/dist/client/with-router'
import config, { Pool } from '../../../../../config'
import { GetStaticProps } from 'next'
import Container from '../../../../../components/Container'
import Head from 'next/head'

interface Props extends WithRouterProps {
  root: string
  pool: Pool
}

class InvestmentPage extends React.Component<Props> {
  render() {
    const { pool } = this.props

    return (
      <WithFooter>
        <Head>
          <title>Investments: {pool.name} | Tinlake | Centrifuge</title>
        </Head>
        <Header poolTitle={pool.shortName || pool.name} selectedRoute={'/investments'} menuItems={menuItems} />
        <Container>
          <Box justify="center" direction="row">
            <Box width="xlarge">
              <WithTinlake
                addresses={pool.addresses}
                contractConfig={pool.contractConfig}
                render={(tinlake) => (
                  <Auth
                    tinlake={tinlake}
                    render={(auth) => (
                      <Box>
                        {'version' in tinlake && tinlake.version === 3 && (
                          <RevolvingPoolInvestmentsView pool={pool} tinlake={tinlake} />
                        )}
                        {!('version' in tinlake) && (
                          <>
                            <SecondaryHeader>
                              <Heading level="3">Investments</Heading>
                            </SecondaryHeader>
                            <InvestmentsView tinlake={tinlake} auth={auth} />
                          </>
                        )}
                      </Box>
                    )}
                  />
                )}
              />
            </Box>
          </Box>
        </Container>
      </WithFooter>
    )
  }
}

export async function getStaticPaths() {
  // We'll pre-render only these paths at build time.
  const paths = config.pools.map((pool) => ({ params: { root: pool.addresses.ROOT_CONTRACT, slug: pool.slug } }))

  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return { props: { root: params?.root, pool: config.pools.find((p) => p.addresses.ROOT_CONTRACT === params?.root) } }
}

export default InvestmentPage
