import { SITE_URL } from "./config";

const NAME = "Nogglesrails Trick Log";

/** `fc:miniapp` meta value: a cast embed that opens the app at `path`. */
export function miniAppEmbed(path: string) {
  return {
    version: "1",
    imageUrl: `${SITE_URL}/og.png`,
    button: {
      title: "Log a trick",
      action: {
        type: "launch_miniapp",
        name: NAME,
        url: `${SITE_URL}${path}`,
        splashImageUrl: `${SITE_URL}/icon.png`,
        splashBackgroundColor: "#0b0b0c",
      },
    },
  };
}

export function miniAppManifest() {
  return {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER ?? "",
      payload: process.env.FARCASTER_PAYLOAD ?? "",
      signature: process.env.FARCASTER_SIGNATURE ?? "",
    },
    miniapp: {
      version: "1",
      name: NAME,
      subtitle: "Land it on a Noggles Rail",
      description: "Log tricks landed on Gnars Noggles Rails onchain and claim Gnars bounties with the clip.",
      iconUrl: `${SITE_URL}/icon.png`,
      homeUrl: SITE_URL,
      imageUrl: `${SITE_URL}/og.png`,
      buttonTitle: "Log a trick",
      splashImageUrl: `${SITE_URL}/icon.png`,
      splashBackgroundColor: "#0b0b0c",
      primaryCategory: "social",
      tags: ["skate", "gnars", "nouns", "base", "bounties"],
      heroImageUrl: `${SITE_URL}/og.png`,
      tagline: "Land it on a Noggles Rail",
      requiredChains: ["eip155:8453"],
    },
  };
}
