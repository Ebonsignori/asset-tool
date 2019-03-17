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

  print () {
    if (this.type === Asset.TYPE.EXPENSE) {
      console.log(this.label + ': ' + chalk.red.bold(this.format()))
    }
    if (this.type === Asset.TYPE.INCOME) {
      console.log(this.label + ': ' + chalk.green.bold(this.format()))
    }
    if (this.type === Asset.TYPE.SAVING) {
      console.log(this.label + ': ' + chalk.keyword('orange').bold(this.format()))
    }
    if (this.type === Asset.TYPE.INVESTMENT) {
      console.log(this.label + ': ' + chalk.greenBright.bold(this.format()))
    }
    if (this.type === Asset.TYPE.TOTAL) {
      const label = this.label.toLowerCase()
      if (label.includes('income')) {
        console.log(this.label + ': ' + chalk.green.bgBlack.bold(this.format()))
      } else if (label.includes('expense')) {
        console.log(this.label + ': ' + chalk.red.bgBlack.bold(this.format()))
      } else if (label.includes('remaining')) {
        console.log(this.label + ': ' + chalk.yellow.bgBlack.bold(this.format()))
      } else if (label.includes('saving')) {
        console.log(this.label + ': ' + chalk.keyword('orange').bgBlack.bold(this.format()))
      } else if (label.includes('investment')) {
        console.log(this.label + ': ' + chalk.greenBright.bgBlack.bold(this.format()))
      } else {
        console.log(this.label + ': ' + chalk.bold(this.format()))
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
  TOTAL: 'total',
  INCOME: 'income',
  INVESTMENT: 'investment',
  EXPENSE: 'expense',
  SAVING: 'saving',
  REMAINING: 'remaining'
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

Asset.generateSummary = (opts, everything) => {
  if (everything && !Array.isArray(everything)) throw TypeError('Must include an array of Assets.')
  if (!everything) everything = includedAssets

  const [ intervalTotals, perItemIntervalAndType ] = getTotals(everything)

  generateHTML(Asset, intervalTotals, perItemIntervalAndType, opts)
}

Asset.printInterval = (interval, everything) => {
  if (everything && !Array.isArray(everything)) throw TypeError('Must include an array of Assets.')
  if (!everything) everything = includedAssets
  if (!interval) throw TypeError('Must specify an interval.')

  const [ intervalTotals, perItemIntervalAndType ] = getTotals(everything)

  console.log(chalk.blue.bold(`${upperCaseFirst(interval)} Totals: `))

  // Print totals for interval
  for (const type of Object.values(Asset.TYPE)) {
    if (intervalTotals[interval][type]) intervalTotals[interval][type].print()
  }

  console.log(' ')
  console.log(chalk.blue.bold(`${upperCaseFirst(interval)} Breakdown: `))

  // Print breakdown for interval
  for (const type of Object.values(Asset.TYPE)) {
    if (perItemIntervalAndType[interval][type]) {
      console.log(chalk.blue(perItemIntervalAndType[interval][type].label))
      if (perItemIntervalAndType[interval][type].length > 0) {
        for (const item of perItemIntervalAndType[interval][type]) {
          item.print()
        }
      } else {
        console.log(chalk.red('None'))
      }
    }
  }
}

Asset.printAll = (everything) => {
  if (everything && !Array.isArray(everything)) throw TypeError('Must include an array of Assets.')
  if (!everything) everything = includedAssets

  for (const interval of Object.values(Asset.INT)) {
    Asset.printInterval(interval, everything)
    console.log('') // newline
  }
}

/* ------------------- Print method helpers  ------------------- */
function getTotals (everything) {
  if (everything && !Array.isArray(everything)) throw TypeError('Must include an array of Assets.')
  if (!everything) everything = includedAssets

  const intervalTotals = {}
  const perItemIntervalAndType = {}
  initTotalsAndItemBreakdownObjects(intervalTotals, perItemIntervalAndType)

  for (const interval of Object.values(Asset.INT)) {
    totalsOverInterval(interval, everything, intervalTotals, perItemIntervalAndType)
  }

  // Sort arrays of items in order of amounts
  for (const interval of Object.values(Asset.INT)) {
    for (const type of Object.values(Asset.TYPE)) {
      if (perItemIntervalAndType[interval][type]) perItemIntervalAndType[interval][type].sort((a, b) => b.amount - a.amount)
    }
  }

  return [ intervalTotals, perItemIntervalAndType ]
}

function initTotalsAndItemBreakdownObjects (intervalTotals, perItemIntervalAndType) {
  for (const interval of Object.values(Asset.INT)) {
    intervalTotals[interval] = {}
    for (const type of Object.values(Asset.TYPE)) {
      if (type === Asset.TYPE.TOTAL) continue
      intervalTotals[interval][type] = Asset.construct(0, total, interval, `Total ${upperCaseFirst(type)}`)
    }
  }

  for (const interval of Object.values(Asset.INT)) {
    perItemIntervalAndType[interval] = {}
    for (const type of Object.values(Asset.TYPE)) {
      if (type === Asset.TYPE.TOTAL) continue
      if (type === Asset.TYPE.REMAINING) continue
      perItemIntervalAndType[interval][type] = []
      perItemIntervalAndType[interval][type].label = `${upperCaseFirst(type)}s`
    }
  }
}

// Calculate everything for interval
function totalsOverInterval (interval, everything, intervalTotals, perItemIntervalAndType) {
  if (!everything) everything = includedAssets

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

    intervalTotals[interval][intervalItem.type].thisAdd(intervalItem)
    perItemIntervalAndType[interval][intervalItem.type].push(intervalItem)
  }

  intervalTotals[interval][Asset.TYPE.REMAINING]
    .thisPlus(intervalTotals[interval][Asset.TYPE.INCOME])
    .thisPlus(intervalTotals[interval][Asset.TYPE.INVESTMENT])
    .thisMinus(intervalTotals[interval][Asset.TYPE.EXPENSE])
    .thisMinus(intervalTotals[interval][Asset.TYPE.SAVING])
}

module.exports = Asset
