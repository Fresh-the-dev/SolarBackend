import { EmbedBuilder } from "discord.js";
import Users from "../../models/Users";
import bcrypt from "bcrypt";
import log from "../../utils/log";
import { getEnv } from "../../utils";

export default async function execute(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  const password = interaction.options.getString("password");
  const userId = interaction.user.id;
  const channelId = getEnv("CHANNEL_ID");

  const user = await Users.findOne({ discordId: userId });

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

  if (password.length > 8) {
    const embed = new EmbedBuilder()
      .setTitle("Failed to Change Password")
      .setDescription(
        "Your account password must be at least 8 characters long."
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

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    await user.updateOne({ $set: { password: hashedPassword } });

    const embed = new EmbedBuilder()
      .setTitle("Password Changed")
      .setDescription("Successfully changed your account's password.")
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
    log.error(`Failed to change password: ${err.message}`, "Bot");
  }
}
