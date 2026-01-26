import auctionConfig from '../auction.config.json';

export interface AuctionConfig {
  auction: {
    item: {
      title: string;
      description: string;
      image_url: string;
    };
    guessing: {
      min_value: number;
      max_value: number;
      allow_updates: boolean;
      tie_breaker: string;
    };
    target: {
      value: number | null;
      hash_algorithm: string;
      publish_hash: boolean;
    };
    timing: {
      deadline_utc: string;
    };
  };
  audio: {
    enabled: boolean;
    src: string;
    autoplay: boolean;
    loop: boolean;
  };
  ui: {
    confirmation_message: string;
    submission_closed_message: string;
  };
}

export function getConfig(): AuctionConfig {
  return auctionConfig as AuctionConfig;
}

export function isDeadlinePassed(): boolean {
  const config = getConfig();
  const deadline = new Date(config.auction.timing.deadline_utc);
  return new Date() > deadline;
}

export function getTargetNumber(): number {
  const targetFromEnv = process.env.AUCTION_TARGET_NUMBER;
  if (!targetFromEnv) {
    throw new Error('AUCTION_TARGET_NUMBER environment variable is not set');
  }
  return parseInt(targetFromEnv, 10);
}
