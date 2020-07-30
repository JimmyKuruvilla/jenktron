/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { app, BrowserWindow } = require('electron')
const { touchBar } = require('./slotmachine')

const debug = /--debug/.test(process.argv[2])

process.on('exit', () => {
  app.quit();
});

let mainWindow = null

function initialize() {
  makeSingleInstance()

  function createWindow() {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName(),

      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    }

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '../assets', '/index.html'))
    if (debug) { mainWindow.webContents.openDevTools(); }
    mainWindow.setTouchBar(touchBar)


    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    app.quit();
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

function makeSingleInstance() {
  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

initialize()
