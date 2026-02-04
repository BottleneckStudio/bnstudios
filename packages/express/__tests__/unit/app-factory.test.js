'use strict'

jest.mock('helmet', () => jest.fn(() => (req, res, next) => next()))
jest.mock('compression', () => jest.fn(() => (req, res, next) => next()))

const { createApp } = require('../../lib/app-factory')
const helmet = require('helmet')
const compression = require('compression')

function createMockExpress() {
  const middlewares = []
  const settings = {}

  const app = {
    use: jest.fn((mw) => middlewares.push(mw)),
    disable: jest.fn((name) => { settings[name] = false }),
    _middlewares: middlewares,
    _settings: settings
  }

  const express = jest.fn(() => app)
  express.json = jest.fn(() => (req, res, next) => next())
  express.urlencoded = jest.fn(() => (req, res, next) => next())

  return { express, app }
}

describe('app-factory', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create an express app', () => {
    const { express } = createMockExpress()

    const app = createApp(express)

    expect(express).toHaveBeenCalledTimes(1)
    expect(app).toBeDefined()
  })

  it('should disable x-powered-by', () => {
    const { express, app } = createMockExpress()

    createApp(express)

    expect(app.disable).toHaveBeenCalledWith('x-powered-by')
  })

  it('should apply helmet middleware', () => {
    const { express } = createMockExpress()

    createApp(express)

    expect(helmet).toHaveBeenCalled()
  })

  it('should apply compression middleware', () => {
    const { express } = createMockExpress()

    createApp(express)

    expect(compression).toHaveBeenCalled()
  })

  it('should apply json body parser', () => {
    const { express } = createMockExpress()

    createApp(express)

    expect(express.json).toHaveBeenCalledWith({ limit: '10mb' })
  })

  it('should apply urlencoded body parser', () => {
    const { express } = createMockExpress()

    createApp(express)

    expect(express.urlencoded).toHaveBeenCalledWith({ extended: true, limit: '10mb' })
  })

  it('should apply 4 middleware layers', () => {
    const { express, app } = createMockExpress()

    createApp(express)

    // helmet, compression, json, urlencoded = 4
    expect(app.use).toHaveBeenCalledTimes(4)
  })
})
