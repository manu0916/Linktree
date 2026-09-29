import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = 100_000;

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error("Execute este comando em um terminal interativo."));
      return;
    }

    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let value = "";

    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
      process.stdout.write("\n");
      resolve(value);
    };

    const onData = (chunk) => {
      if (chunk === "\u0003") {
        process.stdout.write("\n");
        process.exit(130);
      }
      if (chunk === "\r" || chunk === "\n") {
        finish();
        return;
      }
      if (chunk === "\u007f" || chunk === "\b") {
        value = value.slice(0, -1);
        return;
      }
      value += chunk;
    };

    process.stdin.on("data", onData);
  });
}

const password = await readHidden("Digite a senha do administrador: ");

if (password.length < 12 || password.length > 128) {
  throw new Error("A senha deve ter entre 12 e 128 caracteres.");
}

const salt = randomBytes(24);
const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
const output = [
  "pbkdf2",
  ITERATIONS,
  salt.toString("base64url"),
  hash.toString("base64url"),
].join("$");

console.log("\nHash gerado. Cadastre este valor como ADMIN_PASSWORD_HASH:");
console.log(output);
