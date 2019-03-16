const fs = require('fs')
const path = require('path')
const pdf = require('html-pdf')
const opn = require('opn')

let htmlFileName = path.join(__dirname, '.', 'output.html')

module.exports = (intervals, intervalIncomes, intervalCosts, intervalRemaining, perItemIntervalIncome, perItemIntervalCosts, upperCaseFirst, opts) => {
  opts = opts || {}

  let html = `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Breakdown</title>
    <meta name="description" content="Asset breakdown">
    <meta name="author" content="Evan Bonsignori">
    <style>${customStyles()}</style>
    <style>${bootstrapStyles()}</style>
  </head>
  
  <body>
    <div class="container-fluid" style="padding: 25px">
      <div class="row">`

  for (const interval of intervals) {
    const upperInterval = upperCaseFirst(interval)
    html += `
        <div class="col-md-4" style="padding: 25px">
          <h2>
            ${upperInterval}
          </h2>
          <p>
            Assets for the ${upperInterval} interval.
          </p>
          <br />
          <h4>Totals</h4>
          <div class="list-group">
            <div href="#" class="list-group-item justify-content-between gain">Income
              <span class="badge badge-gain">${intervalIncomes[interval].format()}</span>
            </div>
            <div href="#" class="list-group-item justify-content-between loss">Expenses
              <span class="badge badge-loss">${intervalCosts[interval].format()}</span>
            </div>
            <div href="#" class="list-group-item justify-content-between remaining">Remaining
              <span class="badge badge-remaining">${intervalRemaining[interval].format()}</span>
            </div>
          </div>
          <br />
          <h4>Breakdown</h4>
          <p>Income</p>
          <div class="list-group">
          `
    if (perItemIntervalIncome[interval]) {
      for (const item of perItemIntervalIncome[interval]) {
        html +=
          `
              <div href="#" class="list-group-item justify-content-between ${item.type}">${item.label}
                <span class="badge badge-${item.type}">${item.format()}</span>
              </div>
            `
      }
    }
    html += `
          </div>
          <br />
          <p>Expenses</p>
          <div class="list-group">
          `
    if (perItemIntervalCosts[interval]) {
      for (const item of perItemIntervalCosts[interval]) {
        html +=
          `
              <div href="#" class="list-group-item justify-content-between ${item.type}">${item.label}
                <span class="badge badge-${item.type}">${item.format()}</span>
              </div>
            `
      }
    }
    html += `
          </div>
        </div>
    `
  }

  html += `
      </div>
    </div>
  </body>
  
  </html>
  `

  const generatePdf = opts.pdfName || opts.generatePdf || opts.orientation || opts.format

  if (!generatePdf) htmlFileName = './summary.html' || opts.htmlName

  const stream = fs.createWriteStream(htmlFileName)

  const chosenPdfName = opts.pdfName || './summary.pdf'

  stream.once('open', function () {
    stream.end(html)

    if (generatePdf) {
      pdf.create(html, { format: opts.format || 'Letter', orientation: opts.orientation || 'portrait' }).toFile(chosenPdfName, (err, res) => {
        if (err) return console.log(err)
        if (!opts.noLogging) {
          console.log(`Your PDF summary has been generated: ${chosenPdfName}`)
        }
        if (opts.open) {
          opn(chosenPdfName, { wait: false })
        }
      })
    } else {
      if (!opts.noLogging) {
        console.log(`Your HTML summary has been generated: ${htmlFileName}`)
      }
      if (opts.open) {
        opn(htmlFileName, { wait: false })
      }
    }
  })
}

function customStyles () {
  return fs.readFileSync(path.join(__dirname, '.', 'css', 'styles.css'), { encoding: 'utf8' })
}
function bootstrapStyles () {
  return fs.readFileSync(path.join(__dirname, '.', 'css', 'bootstrap.min.css'), { encoding: 'utf8' })
}
