/*
 * Copyright (c) 2019, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  jti: { type: String, index: true },
  email: { type: String, index: true },
  issuedAt: { type: Date },
  expiresAt: { type: Date },
  revoked: { type: Boolean, default: false, index: true },
  revokedAt: { type: Date },
});

tokenSchema.methods.revoke = function revoke() {
  if (this.revoked) {
    return Promise.resolve(this);
  }

  this.revoked = true;
  this.revokedAt = new Date();

  return this.save();
};

tokenSchema.methods.isRevoked = function isRevoked() {
  return this.revoked;
};

tokenSchema.statics.create = function create({
  jti, email, exp, iat,
}) {
  const Token = this.model('Token');
  // convert iat (in Unix timestamp, seconds) to milliseconds
  const issuedAt = new Date(iat * 1000);
  // convert exp (in Unix timestamp, seconds) to milliseconds
  const expiresAt = new Date(exp * 1000);

  const token = new Token({
    jti, email, expiresAt, issuedAt,
  });
  return token.save();
};

tokenSchema.statics.findByJTI = function findByJTI(jti) {
  return this.model('Token')
    .findOne({ jti })
    .exec();
};

/* eslint new-cap: ["error", { "newIsCap": false }] */
const Token = new mongoose.model('Token', tokenSchema);

export default Token;
