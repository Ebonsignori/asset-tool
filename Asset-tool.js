const chalk = require('chalk')
const generateHTML = require('./html-generator')

let includedAssets = []

class Asset {
  constructor (amount, { type, interval, label } = { type: 'expense', interval: 'monthly', label: 'Unlabelled' }, isCents) {
    if (!type) type = 'expense'
    if (!interval) interval = 'monthly'
    if (!label) label = 'Unlabelled'

    // Unique Asset identifier
    this.isAsset = true

    // If array is passed in for amount, take average
    if (Array.isArray(amount)) {
      let total = 0
      for (const a of amount) {
        total += a
      }
      amount = Math.round(total / amount.length)
    }

    // - - - Validate args - - -
    if (typeof amount !== 'number') throw TypeError('Amount must be included as a single number or as an array of numbers to be averaged.')
    if (type && !Object.values(Asset.TYPE).includes(type)) throw TypeError('invalid type of asset.')
    if (interval && !Object.values(Asset.INT).includes(interval)) throw TypeError('invalid interval of asset.')
    if (label && typeof label !== 'string') throw TypeError('label must be a string.')

    // By default, expect amount to be in dollars
    if (isCents) this.amount = amount
    else this.amount = toDollars(amount)

    this.type = type
    this.interval = interval
    this.label = label

    // - - - Functions - - -
    this.include = this.include.bind(this)

    this.getAmount = this.getAmount.bind(this)
    this.format = this.format.bind(this)
    this.print = this.print.bind(this)
    this.isIncome = this.isIncome.bind(this)
    this.isExpense = this.isExpense.bind(this)

    // - - - Operation Functions - - -
    this.add = this.add.bind(this)
    this.plus = this.plus.bind(this)
    this.thisAdd = this.thisAdd.bind(this)
    this.thisPlus = this.thisPlus.bind(this)
    this.subtract = this.subtract.bind(this)
    this.minus = this.minus.bind(this)
    this.thisSubtract = this.thisSubtract.bind(this)
    this.thisMinus = this.thisMinus.bind(this)
    this.multiply = this.multiply.bind(this)
    this.times = this.times.bind(this)
    this.thisMultiply = this.thisMultiply.bind(this)
    this.thisTimes = this.thisTimes.bind(this)
    this.divide = this.divide.bind(this)
    this.over = this.over.bind(this)
    this.thisDivide = this.thisDivide.bind(this)
    this.thisOver = this.thisOver.bind(this)
  }

  include () {
    includedAssets.push(this)
  }

  format (isCents) {
    // if (this.amount === 0) return '$0.00'
    // // If only cents
    // if (String(this.amount).length === 2) return `$0.${String(this.amount)}`
    // if (String(this.amount).length === 1) return `$0.0${String(this.amount)}`

    // const stringAmt = String(this.amount)
    // const decimalPos = stringAmt.length - 2

    // return '$' + [stringAmt.slice(0, decimalPos), '.', stringAmt.slice(decimalPos)].join('')
    let amount = this.amount
    if (!isCents) amount = toCents(amount)
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  print (gain) {
    if (this.type === Asset.TYPE.EXPENSE) {
      console.log(this.label + ': ' + chalk.red.bold(this.format()))
    }
    if (this.type === Asset.TYPE.INCOME) {
      console.log(this.label + ': ' + chalk.green.bold(this.format()))
    }
    if (this.type === Asset.TYPE.TOTAL) {
      if (typeof gain === 'undefined') {
        console.log(this.label + ': ' + chalk.black.bgYellow(this.format()))
      } else if (gain) {
        console.log(this.label + ': ' + chalk.black.bgGreen.bold(this.format()))
      } else {
        console.log(this.label + ': ' + chalk.bgRed.bold(this.format()))
      }
    }
  }

  isIncome () {
    return this.type === Asset.TYPE.INCOME
  }

  isExpense () {
    return this.type === Asset.TYPE.EXPENSE
  }

  /* - - - - - - Getters and Setters - - - - - - */

  getAmount () {
    return this.amount
  }

  setLabel (label) {
    if (typeof label !== 'string') throw TypeError('label must be a string')
    this.label = label
    return this
  }

  setType (type) {
    if (type && !Object.values(Asset.TYPE).includes(type)) throw TypeError('invalid type of asset')
    this.type = type
    return this
  }

  setInterval (interval) {
    if (interval && !Object.values(Asset.INT).includes(interval)) throw TypeError('invalid interval of asset')
    this.interval = interval
    return this
  }

  /* - - - - - - Operations - - - - - - */
  // - - - Add - - -
  add (amount, isCents) {
    const newThis = { ...this }
    newThis.amount = newThis.amount + getAmount(amount, isCents)
    return clone(newThis)
  }
  plus (amount, isCents) { return this.add(amount, isCents) } // alias

  thisAdd (amount, isCents) {
    this.amount = this.amount + getAmount(amount, isCents)
    return this
  }
  thisPlus (amount, isCents) { return this.thisAdd(amount, isCents) } // alias

  // - - - Subtract - - -
  subtract (amount, isCents) {
    const newThis = { ...this }
    newThis.amount = newThis.amount - getAmount(amount, isCents)
    return clone(newThis)
  }
  minus (amount, isCents) { return this.subtract(amount, isCents) } // alias

  thisSubtract (amount, isCents) {
    this.amount = this.amount - getAmount(amount, isCents)
    return this
  }
  thisMinus (amount, isCents) { return this.thisSubtract(amount, isCents) } // alias

  // - - - Multiply - - -
  multiply (amount, isCents) {
    const newThis = { ...this }
    newThis.amount = round(newThis.amount * getAmount(amount, isCents))
    return clone(newThis)
  }
  times (amount, isCents) { return this.multiply(amount, isCents) } // alias

  thisMultiply (amount, isCents) {
    this.amount = round(this.amount * getAmount(amount, isCents))
    return this
  }
  thisTimes (amount, isCents) { return this.thisMultiply(amount, isCents) } // alias

  // - - - Divide - - -
  divide (amount, isCents) {
    const newThis = { ...this }
    newThis.amount = round(newThis.amount / getAmount(amount, isCents))
    return clone(newThis)
  }
  over (amount) { return this.divide(amount) } // alias

  thisDivide (amount, isCents) {
    this.amount = round(this.amount / getAmount(amount, isCents))
    return this
  }
  thisOver (amount, isCents) { return this.thisDivide(amount, isCents) } // alias
}

/* ------------------- Helper Functions ------------------- */
function toDollars (amount) {
  return Number(String(amount) + '00')
}

function toCents (amount) {
  return amount / Math.pow(10, 2) // Move decimal 2 to left}
}

// Extract amount from arg is arg is Asset
function getAmount (amountOrAsset, isCents = false) {
  if (amountOrAsset instanceof Asset || amountOrAsset.isAsset) return amountOrAsset.amount
  if (isCents) return amountOrAsset
  else return toDollars(amountOrAsset)
}

// Abstracted in case it needs to be changed
function round (amount) {
  return Math.floor(amount)
}

function clone (old, isCents = true, label) {
  return Asset.construct(old.amount, old.type, old.interval, label || 'Derived Label', isCents)
}

function upperCaseFirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/* ------------------- Static  ------------------- */

// Second constructor shorthand with each arg wrapped in obj
Asset.construct = (amount, type, interval, label, isCents) => {
  return new Asset(amount, { type: type, interval: interval, label: label }, isCents)
}

Asset.TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TOTAL: 'total'
}
Asset.INT = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  ANNUAL: 'annual'
}

// Expose helper functions
Asset.clone = clone
Asset.upperCaseFirst = upperCaseFirst
Asset.getAmount = getAmount
Asset.toCents = toCents
Asset.toDollars = toDollars

/* ------------------- Displaying and Calculating Results ------------------- */

const total = Asset.TYPE.TOTAL
const daily = Asset.INT.DAILY
const monthly = Asset.INT.MONTHLY
const annual = Asset.INT.ANNUAL

const daysInYear = 365
Asset.printAll = (everything) => {
  if (!everything) everything = includedAssets

  const [ intervalIncomes, intervalCosts, intervalRemaining ] = Asset.getTotals(everything)

  for (const interval of Object.values(Asset.INT)) {
    console.log(chalk.blue.bold(`${upperCaseFirst(interval)} assets:`))
    intervalIncomes[interval].print(true)
    intervalCosts[interval].print(false)
    intervalRemaining[interval].print()
    console.log('') // newline
  }
}

Asset.generateSummary = (opts, everything) => {
  if (!everything) everything = includedAssets

  const [ intervalIncomes, intervalCosts, intervalRemaining, perItemIntervalIncome, perItemIntervalCosts ] = Asset.getTotals(everything)

  generateHTML(Object.values(Asset.INT), intervalIncomes, intervalCosts, intervalRemaining, perItemIntervalIncome, perItemIntervalCosts, upperCaseFirst, opts)
}

Asset.getTotals = (everything) => {
  if (!everything) everything = includedAssets
  if (!Array.isArray(everything)) throw TypeError('Must include an array of Assets')

  let intervalIncomes = {}
  let intervalCosts = {}
  let intervalRemaining = {}

  let perItemIntervalIncome = {}
  let perItemIntervalCosts = {}

  for (const interval of Object.values(Asset.INT)) {
    const [ totalIncome, totalCost, totalRemaining ] = totalsOverInterval(interval, everything, perItemIntervalIncome, perItemIntervalCosts)
    intervalIncomes[interval] = totalIncome
    intervalCosts[interval] = totalCost
    intervalRemaining[interval] = totalRemaining

    // Sort costs and incomes in order of amounts
    perItemIntervalIncome[interval] && perItemIntervalIncome[interval].sort((a, b) => b.amount - a.amount)
    perItemIntervalCosts[interval] && perItemIntervalCosts[interval].sort((a, b) => b.amount - a.amount)
  }

  return [ intervalIncomes, intervalCosts, intervalRemaining, perItemIntervalIncome, perItemIntervalCosts ]
}

// Calculate everything for interval
function totalsOverInterval (interval, everything, perItemIntervalIncome, perItemIntervalCosts) {
  if (!everything) everything = includedAssets

  let totalIncome = Asset.construct(0, total, interval, 'Total Income')
  let totalCosts = Asset.construct(0, total, interval, 'Total Costs')

  for (let staticItem of everything) {
    const item = Asset.clone(staticItem, true, staticItem.label)
    let intervalItem

    if (interval === daily) {
      if (item.interval === daily) intervalItem = item
      else if (item.interval === monthly) intervalItem = item.thisTimes(12, true).thisDivide(daysInYear, true)
      else if (item.interval === annual) intervalItem = item.thisDivide(daysInYear, true)
    } else if (interval === monthly) {
      if (item.interval === daily) intervalItem = item.thisTimes(365, true).thisDivide(12, true)
      else if (item.interval === monthly) intervalItem = item
      else if (item.interval === annual) intervalItem = item.thisDivide(12, true)
    } else if (interval === annual) {
      if (item.interval === daily) intervalItem = item.thisTimes(365, true)
      else if (item.interval === monthly) intervalItem = item.thisTimes(12, true)
      else if (item.interval === annual) intervalItem = item
    }

    if (intervalItem.isIncome()) {
      totalIncome = totalIncome.thisAdd(intervalItem)
      if (!perItemIntervalIncome[interval]) perItemIntervalIncome[interval] = []
      perItemIntervalIncome[interval].push(intervalItem)
    }
    if (intervalItem.isExpense()) {
      totalCosts = totalCosts.thisAdd(intervalItem)
      if (!perItemIntervalCosts[interval]) perItemIntervalCosts[interval] = []
      perItemIntervalCosts[interval].push(intervalItem)
    }
  }

  return [totalIncome, totalCosts, totalIncome.minus(totalCosts).setLabel('Total Remaining'), perItemIntervalCosts, perItemIntervalIncome]
}

Asset.printInterval = function everything (interval, everything) {
  if (!everything) everything = includedAssets
  if (!Array.isArray(everything)) throw TypeError('Must include an array of Assets')
  if (!interval) throw TypeError('Must specify interval')

  let perItemIntervalIncome = {}
  let perItemIntervalCosts = {}

  console.log(chalk.blue.bold(`${upperCaseFirst(interval)} Totals: `))

  // Calculate everything
  const [ totalIncome, totalCost, totalRemaining ] = totalsOverInterval(interval, everything, perItemIntervalIncome, perItemIntervalCosts)

  // Sort costs and incomes in order of amounts
  perItemIntervalIncome[interval] && perItemIntervalIncome[interval].sort((a, b) => b.amount - a.amount)
  perItemIntervalCosts[interval] && perItemIntervalCosts[interval].sort((a, b) => b.amount - a.amount)

  // Print totals
  totalIncome.print(true)
  totalCost.print(false)
  totalRemaining.print()
  console.log(' ')

  // Print breakdown
  console.log(chalk.blue.bold(`${upperCaseFirst(interval)} Breakdown: `))
  console.log(chalk.blue(`${upperCaseFirst(interval)} Income`))
  if (perItemIntervalIncome[interval]) {
    for (const item of perItemIntervalIncome[interval]) {
      item.print()
    }
  }
  console.log(' ')
  console.log(chalk.blue(`${upperCaseFirst(interval)} Expenses`))
  if (perItemIntervalCosts[interval]) {
    for (const item of perItemIntervalCosts[interval]) {
      item.print()
    }
  }
}

module.exports = Asset
