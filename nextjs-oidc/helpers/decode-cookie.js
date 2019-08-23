const crypto = require("crypto");

const {
  COOKIE_NAME_SEP,
  DEFAULT_SIGNATURE_ALGO,
  DEFAULT_ENCRYPTION_ALGO,
  KDF_ENC,
  KDF_MAC,
  zeroBuffer,
  computeHmac,
  base64urldecode,
  deriveKey,
  constantTimeEquals
} = require("./common");

module.exports = (secret, content, cookieName) => {
  if (!secret) {
    throw new Error("cannot set up sessions without a secret");
  }

  var opts = {
    encryptionKey: deriveKey(secret, KDF_ENC),
    signatureKey: deriveKey(secret, KDF_MAC),
    encryptionAlgorithm: DEFAULT_ENCRYPTION_ALGO,
    signatureAlgorithm: DEFAULT_SIGNATURE_ALGO,
    cookieName: cookieName || "nextjs-oidc"
  };

  // stop at any time if there's an issue
  var components = content.split(".");

  if (components.length !== 5) {
    return;
  }

  var iv;
  var ciphertext;
  var hmac;

  try {
    iv = base64urldecode(components[0]);
    ciphertext = base64urldecode(components[1]);
    hmac = base64urldecode(components[4]);
  } catch (ignored) {
    cleanup();
    return;
  }

  var createdAt = parseInt(components[2], 10);
  var duration = parseInt(components[3], 10);

  function cleanup() {
    if (iv) {
      zeroBuffer(iv);
    }

    if (ciphertext) {
      zeroBuffer(ciphertext);
    }

    if (hmac) {
      zeroBuffer(hmac);
    }

    if (expectedHmac) {
      // declared below
      zeroBuffer(expectedHmac);
    }
  }

  // make sure IV is right length
  if (iv.length !== 16) {
    cleanup();
    return;
  }

  // check hmac
  var expectedHmac = computeHmac(opts, iv, ciphertext, duration, createdAt);

  if (!constantTimeEquals(hmac, expectedHmac)) {
    cleanup();
    return;
  }

  // decrypt
  var cipher = crypto.createDecipheriv(opts.encryptionAlgorithm, opts.encryptionKey, iv);
  var plaintext = cipher.update(ciphertext, "binary", "utf8");
  plaintext += cipher.final("utf8");

  var cookieName = plaintext.substring(0, plaintext.indexOf(COOKIE_NAME_SEP));
  if (cookieName !== opts.cookieName) {
    cleanup();
    return;
  }

  var result;
  try {
    result = {
      content: JSON.parse(plaintext.substring(plaintext.indexOf(COOKIE_NAME_SEP) + 1)),
      createdAt: createdAt,
      duration: duration
    };
  } catch (ignored) {}

  cleanup();
  return result;
};
