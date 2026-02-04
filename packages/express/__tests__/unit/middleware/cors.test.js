'use strict'

jest.mock('cors', () => jest.fn(() => 'cors-middleware'))

const corsFactory = require('../../../lib/middleware/cors')
const cors = require('cors')

describe('middleware/cors', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create cors middleware with defaults', () => {
    const result = corsFactory.create()

    expect(cors).toHaveBeenCalledWith({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false
    })
    expect(result).toBe('cors-middleware')
  })

  it('should force credentials false when origin is wildcard', () => {
    corsFactory.create({ origin: '*', credentials: true })

    expect(cors).toHaveBeenCalledWith(
      expect.objectContaining({ origin: '*', credentials: false })
    )
  })

  it('should allow credentials with specific origin', () => {
    corsFactory.create({ origin: 'https://example.com' })

    expect(cors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'https://example.com',
        credentials: true
      })
    )
  })

  it('should merge custom options', () => {
    corsFactory.create({
      origin: 'https://example.com',
      methods: ['GET', 'POST'],
      credentials: false
    })

    expect(cors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'https://example.com',
        methods: ['GET', 'POST'],
        credentials: false
      })
    )
  })

  it('should accept custom allowedHeaders', () => {
    corsFactory.create({ allowedHeaders: ['X-Custom'] })

    expect(cors).toHaveBeenCalledWith(
      expect.objectContaining({ allowedHeaders: ['X-Custom'] })
    )
  })
})
