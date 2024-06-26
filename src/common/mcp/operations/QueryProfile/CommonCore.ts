import fs from "node:fs";
import log from "../../../../utils/log";
import { CommonCoreData, CommonCoreProfile } from "../../../../interface";
import { getDefaultCommonCoreData, mapPurchasesData } from "../../../../utils";

export default async function ProfileCommonCore(
  Account: any,
  accountId: string,
  profileId: string,
  simpleProfile?: boolean
): Promise<CommonCoreProfile | CommonCoreData> {
  try {
    let [account] = await Promise.all([Account.findOne({ accountId }).lean()]);

    if (!account) {
      return simpleProfile
        ? getDefaultCommonCoreData(profileId)
        : getDefaultCommonCoreData(profileId);
    }

    if (!account.baseRevision) {
      await Account.updateOne(
        { accountId },
        { baseRevision: account.profilerevision - 1 }
      );
      account = await Account.findOne({ accountId }).lean().exec();
    }

    const commonCoreData: CommonCoreData = {
      profileRevision: account.profilerevision || 0,
      profileId,
      profileChangesBaseRevision: account.BaseRevision || 0,
      profileChanges: [
        {
          changeType: "fullProfileUpdate",
          _id: "RANDOM",
          profile: {
            _id: "RANDOM",
            Update: "",
            Created: "2021-03-07T16:33:28.462Z",
            updated: new Date().toISOString(),
            rvn: 0,
            wipeNumber: 1,
            accountId: "",
            profileId,
            version: "no_version",
            items: {
              Currency: {
                templateId: "Currency:MtxPurchased",
                attributes: {
                  platform: "EpicPC",
                },
                quantity: account.vbucks,
              },
            },
            stats: {
              attributes: {
                survey_data: {},
                personal_offers: {},
                intro_game_played: true,
                import_friends_claimed: {},
                mtx_affiliate: "",
                undo_cooldowns: [],
                mtx_affiliate_set_time: "",
                mtx_purchase_history: {
                  refundsUsed: 3,
                  refundCredits: 0,
                  purchases: mapPurchasesData(account.items),
                },
                inventory_limit_bonus: 0,
                current_mtx_platform: "EpicPC",
                weekly_purchases: {},
                daily_purchases: {},
                ban_history: {},
                in_app_purchases: {},
                permissions: [],
                undo_timeout: "min",
                monthly_purchases: {},
                allowed_to_send_gifts: true,
                mfa_enabled: true,
                allowed_to_receive_gifts: true,
                gift_history: {},
              },
            },
            commandRevision: 5,
          },
        },
      ],
      serverTime: new Date().toISOString(),
      profileCommandRevision: account.profilerevision,
      responseVersion: 1,
    };

    const commonCore = require("../../../resources/mcp/Common_Core.json");
    commonCoreData.profileChanges[0].profile.items = {
      ...commonCoreData.profileChanges[0].profile.items,
      ...commonCore,
    };

    if (simpleProfile) return commonCoreData.profileChanges[0].profile;
    return commonCoreData;
  } catch (error) {
    let err: Error = error as Error;
    log.error(
      `Error in ProfileCommonCore: ${err.message}`,
      "ProfileCommonCore"
    );
    throw error;
  }
}
