'use strict'

const ZeroFrame = require('./ZeroFrame')

class Page extends ZeroFrame {
  setSiteInfo (siteInfo) {
    const out = document.getElementById('out')

    out.innerHTML =
      '<h1>Site Details</h1>' +
      '- Page address: <span class="details">' + siteInfo.address + '</span>' +
      '<br>- Peers: <span class="details">' + siteInfo.peers + '</span>' +
      '<br>- Size: <span class="details">' + siteInfo.settings.size + '</span>' +
      '<br>- Modified: <span class="details">' + (new Date(siteInfo.content.modified * 1000)) + '</span>'
  }

  onOpenWebsocket () {
    this.cmd('siteInfo', [], function (siteInfo) {
      page.setSiteInfo(siteInfo)
    })
  }

  onRequest (cmd, message) {
    if (cmd === 'setSiteInfo') {
      this.setSiteInfo(message.params)
    } else {
      this.log('Unknown incoming message:', cmd)
    }
  }
}

const page = new Page()
