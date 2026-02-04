'use strict'

const { setupHealthCheck } = require('../../lib/health')

describe('health', () => {
  it('should register a GET /health route', () => {
    const app = { get: jest.fn() }

    setupHealthCheck(app, 'test-service')

    expect(app.get).toHaveBeenCalledWith('/health', expect.any(Function))
  })

  it('should respond with healthy status', () => {
    const app = { get: jest.fn() }
    setupHealthCheck(app, 'test-service')

    const handler = app.get.mock.calls[0][1]
    const req = {}
    const json = jest.fn()
    const res = { headersSent: false, status: jest.fn(() => ({ json })) }

    handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        service: 'test-service',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      })
    )
  })

  it('should not send response if headers already sent', () => {
    const app = { get: jest.fn() }
    setupHealthCheck(app, 'test-service')

    const handler = app.get.mock.calls[0][1]
    const req = {}
    const res = { headersSent: true, status: jest.fn() }

    handler(req, res)

    expect(res.status).not.toHaveBeenCalled()
  })
})
