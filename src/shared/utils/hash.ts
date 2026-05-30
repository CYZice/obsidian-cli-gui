let cryptoModule: {
  createHash?: (algorithm: string) => {
    update(value: string): { digest(encoding: "hex"): string };
  };
} | null = null;

try {
  cryptoModule = require("crypto");
} catch {
  cryptoModule = null;
}

export function generateSimpleHash(input: string): string {
  let hash = 0;
  if (input.length === 0) {
    return hash.toString(16);
  }

  for (let index = 0; index < input.length; index++) {
    const charCode = input.charCodeAt(index);
    hash = (hash << 5) - hash + charCode;
    hash &= hash;
  }

  return (
    Math.abs(hash).toString(16) +
    input.length.toString(16) +
    Date.now().toString(16).slice(-8)
  )
    .padStart(64, "0")
    .slice(0, 64);
}

export function generateSecureHash(input: string, salt: string | null = null): string | Promise<string> {
  const resolvedSalt = salt || `cli_salt_${Math.floor(Date.now() / 864e5)}_security`;
  const saltedInput = resolvedSalt + input + resolvedSalt;

  if (cryptoModule?.createHash) {
    try {
      const hash = cryptoModule.createHash("sha256");
      return hash.update(saltedInput).digest("hex");
    } catch {
      // Fall back below.
    }
  }

  if (typeof window !== "undefined" && window.crypto?.subtle) {
    try {
      return window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(saltedInput))
        .then((buffer) =>
          Array.from(new Uint8Array(buffer))
            .map((value) => value.toString(16).padStart(2, "0"))
            .join(""),
        )
        .catch(() => generateSimpleHash(saltedInput));
    } catch {
      // Fall back below.
    }
  }

  return generateSimpleHash(saltedInput);
}
