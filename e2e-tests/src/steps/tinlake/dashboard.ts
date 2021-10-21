import { Then } from '@cucumber/cucumber'
import * as assert from 'assert'
import { tinlake } from '../../selectors'
import { CentrifugeWorld } from '../../support/world'
import { getTextContent } from '../../utils/getTextContent'

Then('I see at least one pool in the list', async function (this: CentrifugeWorld) {
  await this.currentPage.waitForSelector('[data-test="pool-list"] > a')

  const pools = await this.currentPage.$$('[data-test="pool-list"] > a')
  assert.ok(pools.length > 0)
})

Then('the first pool in the list has a positive DROP APR', async function (this: CentrifugeWorld) {
  const firstVal = await this.currentPage.waitForXPath(tinlake('dashboardPage.poolList.entries.first.aprCol.value'))
  const value = await getTextContent(firstVal)

  assert.ok(parseFloat(value) > 0)
})

Then('the total value locked is positive', async function (this: CentrifugeWorld) {
  const totalValueLocked = await this.currentPage.waitForSelector('[data-test="total-value-locked"]')

  const value = await getTextContent(totalValueLocked)

  assert.ok(parseFloat(value.replace(/,/gi, '')) > 0)
})
