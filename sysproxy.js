// https://www.npmjs.com/package/net-proxied
const { WindowsProxied, WindowsProxyConfig, MacProxied, MacProxyConfig } = require('net-proxied')

const proxyStatus = async () => {
  switch (process.platform) {
    case 'win32':
      return WindowsProxied.status()
    case 'darwin':
      return MacProxied.status()
    default:
      return null
  }
}

const openProxy = async (server, port, passProxies) => {
  switch (process.platform) {
    case 'win32':
      winOpenProxy(server, port, passProxies)
      break
    case 'darwin':
      darwinOpenProxy(server, port, passProxies)
      break
    default:
      console.warn('open proxy failed: unsupport ' + platform)
      break
  }
}

const closeProxy = async () => {
  switch (process.platform) {
    case 'win32':
      winCloseProxy()
      break
    case 'darwin':
      darwinCloseProxy()
      break
    default:
      console.warn('close proxy failed: unsupport ' + platform)
      break
  }
}

const winOpenProxy = (server, port, passProxies) => {
  try {
    let proxyConfig = new WindowsProxyConfig()
    proxyConfig.hostname = server
    proxyConfig.port = port
    proxyConfig.types = ['http', 'https', 'ftp', 'socks']
    proxyConfig.override = passProxies
    WindowsProxied.enable(proxyConfig)
  } catch (err) {
    console.warn('open windows proxy failed', err)
  }
}

const winCloseProxy = () => {
  try {
    WindowsProxied.disable()
  } catch (err) {
    console.warn('close windows proxy failed', err)
  }
}

const darwinOpenProxy = (server, port, passProxies) => {
  for (let name of darwinNetworkServiceNames()) {
    try {
      let config = new MacProxyConfig()
      config.networkServiceNames = ['\'' + name + '\'']
      config.hostname = server
      config.port = port
      config.types = ['web', 'secureweb']
      config.passDomains = passProxies
      MacProxied.enable(config)
    } catch (err) {
      console.warn('open darwin(' + name + ') proxy failed', err)
    }
  }
}

const darwinCloseProxy = () => {
  for (let name of darwinNetworkServiceNames()) {
    try {
      MacProxied.disable({
        networkServiceNames: ['\'' + name + '\''],
        types: ['web', 'secureweb'],
      })
    } catch (err) {
      console.warn('close darwin(' + name + ') proxy failed', err)
    }
  }
}

const darwinNetworkServiceNames = () => {
  let names = []
  for (let service of MacProxied.listNetworkServices()) {
    if (service.enabled) {
      names.push(service.name)
    }
  }
  return names
}

module.exports = {
  proxyStatus,
  openProxy,
  closeProxy,
}