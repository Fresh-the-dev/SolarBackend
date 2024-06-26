import { EmbedBuilder } from "discord.js";
import Users from "../../models/Users";
import bcrypt from "bcrypt";
import log from "../../utils/log";
import { Globals } from "../../xmpp/types/XmppTypes";
import { getEnv } from "../../utils";

export default async function execute(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  const username = interaction.options.getString("username");
  const userId = interaction.user.id;
  const user = await Users.findOne({ discordId: userId });
  const channelId = getEnv("CHANNEL_ID");

  if (!user) {
    const embed = new EmbedBuilder()
      .setTitle("Account Not Found")
      .setDescription("Unable to find your account, Please try again.")
      .setColor("#FF0000")
      .setFooter({
        text: "Solar",
        iconURL:
          "https://media.discordapp.net/attachments/1211829266912907264/1254553165962149938/a4f89e9795474cdc3d931d29c7f20d51.png?ex=6679e9",
      })
      .setTimestamp();

    return await interaction.editReply({ embeds: [embed] });
  }

  const AccessToken = Globals.AccessTokens.find(
    (data) => data.accountId === user.accountId
  );

  if (AccessToken) {
    const embed = new EmbedBuilder()
      .setTitle("Failed to change Username")
      .setDescription(
        "Unable to change your username becuase you are currently logged into Fortnite."
      )
      .setColor("#FF0000")
      .setFooter({
        text: "Solar",
        iconURL:
          "https://media.discordapp.net/attachments/1211829266912907264/1254553165962149938/a4f89e9795474cdc3d931d29c7f20d51.png?ex=6679e9",
      })
      .setTimestamp();

    return await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.channelId !== channelId) {
    const embed = new EmbedBuilder()
      .setTitle("Command Not Allowed")
      .setDescription(`You can only use this command in <#${channelId}>`)
      .setColor("#F01414")
      .setFooter({
        text: "Solar",
        iconURL:
          "https://media.discordapp.net/attachments/1211829266912907264/1254553165962149938/a4f89e9795474cdc3d931d29c7f20d51.png?ex=6679e9",
      })
      .setTimestamp();

    return await interaction.editReply({ embeds: [embed] });
  }

  try {
    await user.updateOne({ $set: { username } });

    const embed = new EmbedBuilder()
      .setTitle("Username Changed")
      .setDescription("Successfully changed your account's username.")
      .setColor("#2B2D31")
      .setFooter({
        text: "Solar",
        iconURL:
          "https://media.discordapp.net/attachments/1211829266912907264/1254553165962149938/a4f89e9795474cdc3d931d29c7f20d51.png?ex=6679e9",
      })
      .setTimestamp();

    return await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    let err: Error = error as Error;
    log.error(`Failed to change username: ${err.message}`, "Bot");
  }
}
