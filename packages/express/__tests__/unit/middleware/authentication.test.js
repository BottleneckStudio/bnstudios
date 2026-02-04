'use strict'

const authFactory = require('../../../lib/middleware/authentication')

describe('middleware/authentication', () => {
  function createMockReq(overrides = {}) {
    return {
      path: '/api/data',
      headers: {},
      ...overrides
    }
  }

  function createMockRes() {
    const json = jest.fn()
    return {
      headersSent: false,
      status: jest.fn(() => ({ json })),
      _json: json
    }
  }

  it('should return a middleware function', () => {
    const middleware = authFactory.create()

    expect(typeof middleware).toBe('function')
  })

  it('should skip excluded paths', async () => {
    const middleware = authFactory.create({ excludePaths: ['/health'] })
    const req = createMockReq({ path: '/health' })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return 401 when token is missing', async () => {
    const logger = { warn: jest.fn(), error: jest.fn() }
    const middleware = authFactory.create({ excludePaths: [] }, { logger })
    const req = createMockReq()
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res._json).toHaveBeenCalledWith({ error: 'Authentication required' })
    expect(logger.warn).toHaveBeenCalled()
  })

  it('should pass with default validator when token exists', async () => {
    const middleware = authFactory.create({ excludePaths: [] })
    const req = createMockReq({ headers: { authorization: 'Bearer token123' } })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual({ authenticated: true })
  })

  it('should use custom validator function', async () => {
    const validator = jest.fn().mockResolvedValue({ id: 1, name: 'Alice' })
    const middleware = authFactory.create({ excludePaths: [], validator })
    const req = createMockReq({ headers: { authorization: 'Bearer token123' } })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(validator).toHaveBeenCalledWith('Bearer token123')
    expect(req.user).toEqual({ id: 1, name: 'Alice' })
    expect(next).toHaveBeenCalled()
  })

  it('should return 401 when custom validator throws without leaking details', async () => {
    const logger = { warn: jest.fn(), error: jest.fn() }
    const validator = jest.fn().mockRejectedValue(new Error('connection to auth-db at 10.0.0.5 refused'))
    const middleware = authFactory.create({ excludePaths: [], validator }, { logger })
    const req = createMockReq({ headers: { authorization: 'Bearer bad-token' } })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res._json).toHaveBeenCalledWith({ error: 'Invalid authentication token' })
    expect(logger.error).toHaveBeenCalled()
  })

  it('should use custom header name', async () => {
    const middleware = authFactory.create({
      excludePaths: [],
      headerName: 'X-Api-Key'
    })
    const req = createMockReq({ headers: { 'x-api-key': 'my-key' } })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual({ authenticated: true })
  })

  it('should skip when headers already sent', async () => {
    const middleware = authFactory.create({ excludePaths: [] })
    const req = createMockReq()
    const res = createMockRes()
    res.headersSent = true
    const next = jest.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should not skip paths that merely start with excluded path prefix', async () => {
    const middleware = authFactory.create({ excludePaths: ['/health'] })
    const req = createMockReq({ path: '/healthcheck' })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('should skip sub-paths of excluded paths', async () => {
    const middleware = authFactory.create({ excludePaths: ['/health'] })
    const req = createMockReq({ path: '/health/ready' })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should default exclude /health and /metrics', async () => {
    const middleware = authFactory.create()
    const req = createMockReq({ path: '/metrics' })
    const res = createMockRes()
    const next = jest.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
