const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  Collection
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel]
});

//MENU
const menuMap = {
  home: {
    message: "👋 Welcome! Choose a category:",
    buttons: [
      { label: "📘 JEE", target: "jee" },
      { label: "🧬 NEET", target: "neet" }
    ]
  },
  jee: {
    message: "📘 JEE Resources:",
    buttons: [
      { label: "PW Modules", url: "https://mega.nz/folder/0EgAhKrY#9_fJ9r5HfHURYp7vuYYl-A" },
      { label: "ALLEN Modules", url: "https://mega.nz/folder/0V5CTKob#qxqV4FJzPTmfz_AxOgd8ow" },
      { label: "Cengage Mathematics", url: "https://mega.nz/file/ZN5yzTCR#4wU4h8rv7esMZ7Iw3XXQ7c6gR38aVgam8kAQdMI0bbc" }
    ]
  },
  neet: {
    message: "🧬 NEET Resources:",
    buttons: [
      { label: "PW Modules", url: "https://mega.nz/folder/NEgzgRxB#xCgbJhuWVkBJbyaR5IU7Og" }
    ]
  }
};

//BUTTON CLICK CLICK EHEHE
function generateUI(sectionKey) {
  const section = menuMap[sectionKey];
  const embed = new EmbedBuilder()
    .setTitle("📚 Resource Bot")
    .setDescription(section.message)
    .setColor("Blue");

  const rows = [];

  const row = new ActionRowBuilder();
  for (const btn of section.buttons) {
    const button = new ButtonBuilder()
      .setLabel(btn.label)
      .setStyle(btn.url ? ButtonStyle.Link : ButtonStyle.Primary);

    if (btn.url) {
      button.setURL(btn.url);
    } else {
      button.setCustomId(`goto_${btn.target}`);
    }

    row.addComponents(button);
  }

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("⬅️ Back")
      .setCustomId(`back_${sectionKey}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("🏠 Main Menu")
      .setCustomId("goto_home")
      .setStyle(ButtonStyle.Secondary)
  );

  if (row.components.length > 0) rows.push(row);
  rows.push(navRow);

  return { embeds: [embed], components: rows };
}

//COMMAND
const commands = [
  new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start your resource session')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash command registered!');
  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
});

//INTERACTION HANDLER
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'start') {
      if (!interaction.channel.isDMBased()) {
        return interaction.reply({ content: "DM me this command 💌", ephemeral: true });
      }
      const ui = generateUI("home");
      return interaction.reply(ui);
    }
  }

  if (interaction.isButton()) {
    const id = interaction.customId;

    if (id.startsWith("goto_")) {
      const section = id.split("_")[1];
      const ui = generateUI(section);
      return interaction.update(ui);
    }

    if (id.startsWith("back_")) {
      const current = id.split("_")[1];
      let backTo = "home";
      if (current === "jee" || current === "neet") backTo = "home";
      const ui = generateUI(backTo);
      return interaction.update(ui);
    }
  }
});

client.login(process.env.TOKEN);
