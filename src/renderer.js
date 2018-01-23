'use strict'

const puppeteer = require('puppeteer')
const devices = require('puppeteer/DeviceDescriptors');

class Renderer {
  constructor(browser) {
    this.browser = browser
  }

  async createPage(url, { timeout, waitUntil }) {
    let gotoOptions = {
      timeout: Number(timeout) || 30 * 1000,
      waitUntil: waitUntil || 'networkidle2',
    }

    const page = await this.browser.newPage()
    await page.emulate(devices['iPhone 6']); 
    await page.goto(url, gotoOptions)
    return page
  }

  async render(url, options) {
    let page = null
    try {
      const { timeout, waitUntil } = options
      page = await this.createPage(url, { timeout, waitUntil })
      const html = await page.content()
      return html
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async pdf(url, options) {
    let page = null
    try {
      const { timeout, waitUntil, ...extraOptions } = options
      page = await this.createPage(url, { timeout, waitUntil })

      const { scale, displayHeaderFooter, printBackground, landscape } = extraOptions
      const buffer = await page.pdf({
        ...extraOptions,
        scale: Number(scale),
        displayHeaderFooter: displayHeaderFooter === 'true',
        printBackground: printBackground === 'true',
        landscape: landscape === 'true',
      })
      return buffer
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async screenshot(url, options) {
    let page = null
    try {
      const { timeout, waitUntil, ...extraOptions } = options
      page = await this.createPage(url, { timeout, waitUntil })

      const { quality, fullPage, omitBackground } = extraOptions
      const buffer = await page.screenshot({
        ...extraOptions,
        quality: Number(quality) || 100,
        fullPage: fullPage === 'true',
        omitBackground: omitBackground === 'true',
      })
      return buffer
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async close() {
    await this.browser.close()
  }
}

async function create() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  return new Renderer(browser)
}

module.exports = create
