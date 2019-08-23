const crypto = require("crypto");

function forceBuffer(binaryOrBuffer) {
  if (Buffer.isBuffer(binaryOrBuffer)) {
    return binaryOrBuffer;
  } else {
    return new Buffer(binaryOrBuffer, "binary");
  }
}

function zeroBuffer(buf) {
  for (var i = 0; i < buf.length; i++) {
    buf[i] = 0;
  }
  return buf;
}

function hmacInit(algo, key) {
  var match = algo.match(/^([^-]+)(?:-drop(\d+))?$/);
  var baseAlg = match[1];
  var drop = match[2] ? parseInt(match[2], 10) : 0;

  var hmacAlg = crypto.createHmac(baseAlg, key);
  var origDigest = hmacAlg.digest;

  if (drop === 0) {
    // Before 0.10, crypto returns binary-encoded strings. Remove when dropping
    // 0.8 support.
    hmacAlg.digest = function() {
      return forceBuffer(origDigest.call(this));
    };
  } else {
    var N = drop / 8; // bits to bytes
    hmacAlg.digest = function dropN() {
      var result = forceBuffer(origDigest.call(this));
      // Throw away the second half of the 512-bit result, leaving the first
      // 256-bits.
      var truncated = new Buffer(N);
      result.copy(truncated, 0, 0, N);
      zeroBuffer(result);
      return truncated;
    };
  }

  return hmacAlg;
}

module.exports.COOKIE_NAME_SEP = "=";
module.exports.DEFAULT_ENCRYPTION_ALGO = "aes256";
module.exports.KDF_ENC = "cookiesession-encryption";
module.exports.KDF_MAC = "cookiesession-signature";
module.exports.DEFAULT_SIGNATURE_ALGO = "sha256";

module.exports.constantTimeEquals = (a, b) => {
  // Ideally this would be a native function, so it's less sensitive to how the
  // JS engine might optimize.
  if (a.length !== b.length) {
    return false;
  }
  var ret = 0;
  for (var i = 0; i < a.length; i++) {
    ret |= a.readUInt8(i) ^ b.readUInt8(i);
  }
  return ret === 0;
};

module.exports.deriveKey = (master, type) => {
  // eventually we want to use HKDF. For now we'll do something simpler.
  var hmac = crypto.createHmac("sha256", master);
  hmac.update(type);
  return forceBuffer(hmac.digest());
};

module.exports.base64urlencode = arg => {
  var s = arg.toString("base64");
  s = s.split("=")[0]; // Remove any trailing '='s
  s = s.replace(/\+/g, "-"); // 62nd char of encoding
  s = s.replace(/\//g, "_"); // 63rd char of encoding
  // TODO optimize this; we can do much better
  return s;
};

module.exports.base64urldecode = arg => {
  var s = arg;
  s = s.replace(/-/g, "+"); // 62nd char of encoding
  s = s.replace(/_/g, "/"); // 63rd char of encoding
  switch (
    s.length % 4 // Pad with trailing '='s
  ) {
    case 0:
      break; // No pad chars in this case
    case 2:
      s += "==";
      break; // Two pad chars
    case 3:
      s += "=";
      break; // One pad char
    default:
      throw new Error("Illegal base64url string!");
  }
  return new Buffer(s, "base64"); // Standard base64 decoder
};

module.exports.computeHmac = (opts, iv, ciphertext, duration, createdAt) => {
  var hmacAlg = hmacInit(opts.signatureAlgorithm, opts.signatureKey);

  hmacAlg.update(iv);
  hmacAlg.update(".");
  hmacAlg.update(ciphertext);
  hmacAlg.update(".");
  hmacAlg.update(createdAt.toString());
  hmacAlg.update(".");
  hmacAlg.update(duration.toString());

  return hmacAlg.digest();
};

module.exports.hmacInit = hmacInit;
module.exports.forceBuffer = forceBuffer;
module.exports.zeroBuffer = zeroBuffer;
