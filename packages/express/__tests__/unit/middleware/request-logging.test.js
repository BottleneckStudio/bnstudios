'use strict'

jest.mock('@bnstudios/logger', () => ({
  createRequestLogger: jest.fn(() => 'request-logging-middleware')
}))

const requestLoggingFactory = require('../../../lib/middleware/request-logging')
const { createRequestLogger } = require('@bnstudios/logger')

describe('middleware/request-logging', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create request logging middleware', () => {
    const logger = { child: jest.fn() }
    const result = requestLoggingFactory.create({}, { logger })

    expect(createRequestLogger).toHaveBeenCalledWith(logger)
    expect(result).toBe('request-logging-middleware')
  })

  it('should throw when logger is not provided', () => {
    expect(() => requestLoggingFactory.create({}, {})).toThrow(
      'Logger is required for request logging middleware'
    )
  })

  it('should throw when context is empty', () => {
    expect(() => requestLoggingFactory.create()).toThrow()
  })
})
