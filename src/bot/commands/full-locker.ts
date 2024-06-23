import { ColorResolvable, EmbedBuilder } from "discord.js";
import Users from "../../models/Users";
import Accounts from "../../models/Accounts";

async function createEmbed(
  title: string,
  description: string,
  color: ColorResolvable | null
) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({
      text: "Solar",
      iconURL:
        "https://media.discordapp.net/attachments/1211829266912907264/1254553165962149938/a4f89e9795474cdc3d931d29c7f20d51.png?ex=6679e9",
    })
    .setTimestamp();
}

export default async function execute(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  const user = await Users.findOne({
    discordId: interaction.options.getUser("user")?.id,
  });
  const account = await Accounts.findOne({
    discordId: interaction.options.getUser("user")?.id,
  });

  if (!user || !account) {
    const embed = await createEmbed(
      "Account Not Found",
      "Unable to find your account. Please try again.",
      "#FF0000"
    );
    return await interaction.editReply({ embeds: [embed] });
  }

  if (user.banned) {
    const embed = await createEmbed(
      "Banned",
      "This user is banned.",
      "#FF0000"
    );
    return await interaction.editReply({ embeds: [embed] });
  }

  if (user.hasFL) {
    const embed = await createEmbed(
      "Already has Full Locker",
      "This user already has a full locker.",
      "#FF0000"
    );
    return await interaction.editReply({ embeds: [embed] });
  }

  await Users.updateOne(
    { discordId: interaction.options.getUser("user")?.id },
    { hasFL: true }
  );

  const successMessage = `Successfully added full locker to ${
    interaction.options.getUser("user")?.username
  }'s account.`;
  const successEmbed = await createEmbed("Success", successMessage, "#00FF00");
  return await interaction.editReply({
    embeds: [successEmbed],
    ephemeral: true,
  });
}
