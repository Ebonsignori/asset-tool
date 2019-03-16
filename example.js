const Asset = require('.') // IMPORTANT: If using this as a template, comment this out
// const Asset = require('Asset-tool') // IMPORTANT: If using this as a template, uncomment this

const income = Asset.TYPE.INCOME
const expense = Asset.TYPE.EXPENSE

const daily = Asset.INT.DAILY
const monthly = Asset.INT.MONTHLY
const annual = Asset.INT.ANNUAL

/* ------------------- Income ------------------- */
Asset.construct(1000 * 2, income, monthly, 'My Company Name').include()
Asset.construct(200, income, monthly, 'Side Gig').include()

/* ------------------- Expenses ------------------- */
const rent = 850

// Living
Asset.construct(rent, expense, monthly, 'Rent').include()
Asset.construct(20, expense, monthly, 'Renters Insurance').include()
Asset.construct(40, expense, monthly, 'Apartment Fees').include()

// Using default constructor
new Asset(40, {
  type: expense,
  interval: monthly,
  label: 'Water'
}).include()

// When a monthly expense, use the default constructor defaults
new Asset(75, { label: 'Power' }).include()
new Asset(65, { label: 'Internet' }).include()

// Insurance
Asset.construct(1426, expense, annual, 'Car Insurance Estimate').include()
Asset.construct(65, expense, monthly, 'Phone').include()

// Food
Asset.construct(2641, expense, annual, 'Not Included Annual Food Estimate') // Don't include
Asset.construct(10, expense, daily, 'Food Estimate').include()

// Gas
Asset.construct([75, 125], expense, monthly, 'Gas Estimate').include() // If amount is array, average will be taken

// Debt
Asset.construct(150, expense, monthly, 'Student Loans').include()

// Luxury
Asset.construct(120, expense, annual, 'Spotify').include()

/* ------------------- Results ------------------- */

// Asset.printAll()

Asset.printInterval(monthly)

// Asset.generateSummary({ // Generates and opens summary.pdf
//   generatePdf: true,
//   open: true
// })

Asset.generateSummary({
  open: true,
  noLogging: true
})
