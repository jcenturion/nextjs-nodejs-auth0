const crypto = require("crypto");

const {
  COOKIE_NAME_SEP,
  DEFAULT_SIGNATURE_ALGO,
  DEFAULT_ENCRYPTION_ALGO,
  KDF_ENC,
  KDF_MAC,
  zeroBuffer,
  computeHmac,
  base64urlencode,
  forceBuffer,
  deriveKey
} = require("./common");

module.exports = (secret, content, cookieName) => {
  if (!secret) {
    throw new Error("cannot set up sessions without a secret");
  }

  const iv = crypto.randomBytes(16);
  var opts = {
    encryptionKey: deriveKey(secret, KDF_ENC),
    signatureKey: deriveKey(secret, KDF_MAC),
    encryptionAlgorithm: DEFAULT_ENCRYPTION_ALGO,
    signatureAlgorithm: DEFAULT_SIGNATURE_ALGO,
    cookieName: cookieName || "nextjs-oidc"
  };
  const duration = 24 * 60 * 60 * 1000;
  const createdAt = new Date().getTime();

  // encrypt with encryption key
  const plaintext = new Buffer(opts.cookieName + COOKIE_NAME_SEP + JSON.stringify(content), "utf8");
  const cipher = crypto.createCipheriv(opts.encryptionAlgorithm, opts.encryptionKey, iv);
  const ciphertextStart = forceBuffer(cipher.update(plaintext));
  zeroBuffer(plaintext);
  const ciphertextEnd = forceBuffer(cipher.final());
  const ciphertext = Buffer.concat([ciphertextStart, ciphertextEnd]);
  zeroBuffer(ciphertextStart);
  zeroBuffer(ciphertextEnd);

  // hmac it
  const hmac = computeHmac(opts, iv, ciphertext, duration, createdAt);

  const result = [base64urlencode(iv), base64urlencode(ciphertext), createdAt, duration, base64urlencode(hmac)].join(
    "."
  );

  zeroBuffer(iv);
  zeroBuffer(ciphertext);
  zeroBuffer(hmac);

  return result;
};
