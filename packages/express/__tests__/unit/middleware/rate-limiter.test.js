'use strict'

jest.mock('express-rate-limit', () => jest.fn(() => 'rate-limit-middleware'))

const rateLimiterFactory = require('../../../lib/middleware/rate-limiter')
const rateLimit = require('express-rate-limit')

describe('middleware/rate-limiter', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create rate limiter with defaults', () => {
    const result = rateLimiterFactory.create()

    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        windowMs: 15 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later' }
      })
    )
    expect(result).toBe('rate-limit-middleware')
  })

  it('should accept custom window and limit', () => {
    rateLimiterFactory.create({ windowMs: 60000, limit: 10 })

    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ windowMs: 60000, limit: 10 })
    )
  })

  it('should provide a skip function for excludePaths', () => {
    rateLimiterFactory.create({ excludePaths: ['/health', '/metrics'] })

    const callArgs = rateLimit.mock.calls[0][0]
    expect(typeof callArgs.skip).toBe('function')

    expect(callArgs.skip({ path: '/health' })).toBe(true)
    expect(callArgs.skip({ path: '/health/ready' })).toBe(true)
    expect(callArgs.skip({ path: '/metrics' })).toBe(true)
    expect(callArgs.skip({ path: '/api/data' })).toBe(false)
    expect(callArgs.skip({ path: '/healthcheck' })).toBe(false)
  })

  it('should accept custom message', () => {
    const customMessage = { error: 'Rate limited' }
    rateLimiterFactory.create({ message: customMessage })

    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ message: customMessage })
    )
  })
})
