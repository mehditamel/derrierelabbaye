import { emitKeypressEvents } from "node:readline";
import { randomBytes, scryptSync } from "node:crypto";

if (!process.stdin.isTTY) {
  process.stderr.write(
    "Utilisez un terminal interactif : aucun mot de passe ne doit passer dans les arguments.\n"
  );
  process.exitCode = 1;
} else {
  emitKeypressEvents(process.stdin);
  const readSecret = (prompt) =>
    new Promise((resolve, reject) => {
      let value = "";
      process.stdout.write(prompt);
      const done = () => {
        process.stdin.off("keypress", input);
        process.stdout.write("\n");
      };
      function input(text, key) {
        if (key?.ctrl && key.name === "c") {
          done();
          reject(new Error("Annulé."));
        } else if (key?.name === "return") {
          done();
          resolve(value);
        } else if (key?.name === "backspace") value = value.slice(0, -1);
        else if (!key?.ctrl && !key?.meta && text && !/[\r\n\x00-\x1f]/.test(text)) value += text;
      }
      process.stdin.on("keypress", input);
    });
  process.stdin.setRawMode(true);
  process.stdin.resume();
  try {
    const password = await readSecret(
      "Mot de passe équipe (16 caractères minimum, saisie masquée) : "
    );
    if (password.length < 16 || password.length > 200)
      throw new Error("Choisissez entre 16 et 200 caractères.");
    if (password !== (await readSecret("Confirmez le mot de passe : ")))
      throw new Error("Les saisies ne correspondent pas.");
    const salt = randomBytes(16).toString("hex");
    const result = scryptSync(password, salt, 64).toString("hex");
    process.stdout.write(
      "Valeur de TICKET_STAFF_PASSWORD_HASH à placer dans les paramètres sécurisés :\n"
    );
    process.stdout.write("scrypt:" + salt + ":" + result + "\n");
  } catch (error) {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}
