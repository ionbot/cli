const { createInterface } = require("readline");

const { TelegramClient } = require("telegram");
const { Logger } = require("telegram/extensions");
const { StringSession } = require("telegram/sessions");

Logger.setLevel("none");

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getInput = (name) => {
  return new Promise((resolve) => {
    readline.question(`${name}\n> `, resolve);
  });
};

const getNumberInput = async (name) => {
  const result = Number(await getInput(name));

  if (isNaN(result)) {
    console.log(`${name} must be a number.`);
    return await getNumberInput(name);
  }

  return result;
};

module.exports = async function () {
  const client = new TelegramClient(
    new StringSession(""),
    await getNumberInput("API ID"),
    await getInput("API hash"),
    { connectionRetries: 10 }
  );

  await client.start({
    phoneNumber: () => getInput("Phone number"),
    phoneCode: async () => String(await getNumberInput("Code")),
    password: () => getInput("Password"),
    onError: (err) => {
      console.log(`An error occured:\n${err}`);
    },
  });

  const string = client.session.save();

  await client.sendMessage("me", {
    message: `=== BEGIN ION STRING ===\n\n<code>${string}</code>\n\n=== END ION STRING ===`,
    parseMode: "html",
  });

  console.log("Ion string was generated and sent to saved messages.");
};
