'use strict'

jest.mock('helmet', () => jest.fn(() => 'helmet-middleware'))

const helmetFactory = require('../../../lib/middleware/helmet')
const helmet = require('helmet')

describe('middleware/helmet', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create helmet middleware with defaults', () => {
    const result = helmetFactory.create()

    expect(helmet).toHaveBeenCalledWith({})
    expect(result).toBe('helmet-middleware')
  })

  it('should pass custom options to helmet', () => {
    helmetFactory.create({ contentSecurityPolicy: false })

    expect(helmet).toHaveBeenCalledWith({ contentSecurityPolicy: false })
  })
})
