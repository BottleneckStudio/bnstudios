'use strict'

const fs = require('node:fs');
const path = require('node:path');
const pino = require('pino');

jest.mock('pino', () => {
  const dest = jest.fn(() => ({ write: jest.fn() }));
  return { destination: dest };
});

jest.mock('pino-pretty', () => {
  return jest.fn(() => ({ write: jest.fn() }));
});

const { createStream } = require('../lib/streams');

describe('Create Logfile or Streams', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return stdout destination by default', () => {
    createStream();

    expect(pino.destination).toHaveBeenCalledWith(1);
  });

  it('should return stdout destination when logFile is not enabled', () => {

  });

  it('should return pretty print stream when prettyPrint is true', () => {

  });

  it('should return file destination when logFile is enabled', () => {

  });

  it('should create directory if it does not exist', () => {

  });

  it('should prefer file stream over pretty print', () => {

  });
});
