import { EmbedBuilder, WebhookClient } from "discord.js";
import { getEnv } from "../getEnv";
import {
  SavedData,
  ShopItem,
  ShopItemField,
} from "../storefront/types/ShopTypes";

const webhook = new WebhookClient({
  id: getEnv("webhookId"),
  token: getEnv("webhookToken"),
});

function createShopItemEmbed(title: string, items: ShopItem[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`**${title}**`)
    .setColor(0x00ffff)
    .setImage("https://i.ibb.co/bPRgX2K/Solar-Banner.png");

  items.forEach((item) => {
    const fields: ShopItemField[] = [
      { name: "Name", value: item.name, inline: true },
      { name: "Price", value: item.price, inline: true },
      { name: "Rarity", value: item.rarity, inline: true },
    ];

    const formattedFields = fields
      .map((field) => `${field.name}: ${field.value}`)
      .join("\n");

    embed.addFields({
      name: `${item.item}`,
      value: `\`\`\`md\n${formattedFields}\n\`\`\``,
      inline: false,
    });
  });

  return embed;
}

export function SendWebhook(savedData: SavedData): void {
  const weeklyEmbed = createShopItemEmbed("Weekly Items", savedData.weekly);
  const dailyEmbed = createShopItemEmbed("Daily Items", savedData.daily);

  webhook.send({
    content: "",
    username: "Item Shop",
    avatarURL: "",
    embeds: [weeklyEmbed, dailyEmbed],
  });
}
