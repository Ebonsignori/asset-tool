const fs = require('fs')
const path = require('path')
const pdf = require('html-pdf')
const betterOpn = require("better-opn")
const open = require('open')

let htmlFileName = path.join(__dirname, '.', 'output.html')

module.exports = (Asset, intervalTotals, perItemIntervalAndType, opts) => {
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

  // Display each interval in a new column
  for (const interval of Object.values(Asset.INT)) {
    const upperInterval = Asset.upperCaseFirst(interval)
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
            `

    // Display totals for each type
    for (const type of Object.values(Asset.TYPE)) {
      if (intervalTotals[interval][type]) {
        html += `
              <div href="#" class="list-group-item justify-content-between total-${type}">${intervalTotals[interval][type].label}
                <span class="badge badge-total-${type}">${intervalTotals[interval][type].format()}</span>
              </div>
              `
      }
    }

    // Close list group
    html += `
            </div>
            <br />
            <h4>Breakdown</h4>
            `

    // Display breakdown for each type
    for (const type of Object.values(Asset.TYPE)) {
      if (perItemIntervalAndType[interval][type]) {
        html += `
              <br />
              <p>${perItemIntervalAndType[interval][type].label}</p>
              <div class="list-group">
              `
        if (perItemIntervalAndType[interval][type].length > 0) {
          for (const item of perItemIntervalAndType[interval][type]) {
            html += `
                <div href="#" class="list-group-item justify-content-between ${item.type}">${item.label}
                  <span class="badge badge-${item.type}">${item.format()}</span>
                </div>
                `
          }
        } else {
          html += `<div href="#" class="list-group-item justify-content-between">None Included <span class="badge badge-none">$0.00</span></div>`
        }
        // Close Each Breakdown List Group
        html += `</div>`
      }
    }

    // Close interval column
    html += `</div>`
  }

  // Close row, container, and body
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
          open(chosenPdfName, { wait: true, newInstance: false })
        }
      })
    } else {
      if (!opts.noLogging) {
        console.log(`Your HTML summary has been generated: ${htmlFileName}`)
      }
      if (opts.open) {
        betterOpn(`file://${path.resolve(htmlFileName)}`)
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
