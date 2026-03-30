import {
  Level,
  PublishStatus,
  type DialogueType as DialogueTypeEnum,
} from "@/src/generated/prisma/enums";

export type {
  StoryModel,
  EpisodeModel,
  SceneModel,
  CharacterModel,
  CharacterImageModel,
  StoryCharacterModel,
  UnitModel,
  ReviewItemModel,
} from "@/src/generated/prisma/models";

export {
  PublishStatus,
  QuizType,
  QuizSourceType,
  CharacterScope,
  RewardType,
  EpisodeStage,
  DialogueType,
  DialogueSpeakerRole,
  SceneFlowType,
  DialogueFlowType,
  PlayEpisodeMode,
} from "@/src/generated/prisma/enums";

export type {
  PublishStatus as PublishStatusType,
  QuizType as QuizTypeValue,
  QuizSourceType as QuizSourceTypeValue,
  CharacterScope as CharacterScopeValue,
  RewardType as RewardTypeValue,
  DialogueType as DialogueTypeValue,
  SceneFlowType as SceneFlowTypeValue,
  DialogueFlowType as DialogueFlowTypeValue,
  PlayEpisodeMode as PlayEpisodeModeValue,
} from "@/src/generated/prisma/enums";

// Composite types used across pages and hooks

export type StoryType = "UNIT" | "NOVEL" | "PLAY";

export type TagBasic = {
  id: number;
  slug: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoryTagWithTag = {
  storyId: number;
  tagId: number;
  createdAt: string;
  tag: TagBasic;
};

export type StoryWithRelations = {
  id: number;
  title: string;
  koreanTitle: string | null;
  type: StoryType;
  category: string | null;
  icon: string;
  level: Level;
  description: string | null;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  episodes?: EpisodeBasic[];
  storyCharacters?: StoryCharacterWithCharacter[];
  storyTags?: StoryTagWithTag[];
  units?: UnitBasic[];
  _count?: { episodes: number; units: number };
};

export type EpisodeType = "NOVEL" | "PLAY";

export type BranchKeyItem = {
  key: string;
  name: string;
};

export type EpisodeBasic = {
  id: number;
  storyId: number;
  title: string;
  KoreanTitle: string | null;
  order: number;
  type: EpisodeType | null;
  playMode: "ROLEPLAY" | "ROLEPLAY_WITH_EVAL" | null;
  description: string | null;
  koreanDescription: string | null;
  thumbnailUrl: string | null;
  totalScenes: number | null;
  data?: { branchKeys?: BranchKeyItem[] } | null;
  /** JSON (권장: 문자열 배열) */
  tags?: unknown;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED" | "DELETED";
  createdAt: string;
  updatedAt: string;
};

export type EpisodeWithScenes = EpisodeBasic & {
  scenes: SceneBasic[];
  rewards: EpisodeRewardBasic[];
  endings?: EndingBasic[];
};

export type SceneType = "VISUAL" | "CHAT";

export type SceneBasic = {
  id: number;
  episodeId: number;
  type: SceneType;
  flowType: "NORMAL" | "BRANCH" | "BRANCH_TRIGGER" | "BRANCH_AND_TRIGGER";
  branchKey?: string | null;
  endingId?: number | null;
  title: string;
  koreanTitle: string | null;
  order: number;
  bgImageUrl: string | null;
  audioUrl: string | null;
  data: Record<string, unknown> | null;
  status?: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  dialogues?: DialogueBasic[];
};

export type DialogueBasic = {
  id: number;
  sceneId: number;
  order: number;
  flowType: "NORMAL" | "BRANCH";
  type: DialogueTypeEnum;
  speakerRole: "SYSTEM" | "USER" | null;
  characterName: string | null;
  characterId: number | null;
  englishText: string;
  koreanText: string;
  charImageLabel: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  aiPromptName: string | null;
  data: Record<string, unknown> | null;
  character?: {
    id: number;
    name: string;
  } | null;
};

export type CharacterBasic = {
  id: number;
  scope: "GLOBAL" | "STORY";
  name: string;
  koreanName: string | null;
  avatarImage: string | null;
  mainImage: string | null;
  description: string;
  personality: string | null;
  chatPrompt: string | null;
  playEpisodePrompt: string | null;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED" | "DELETED";
  createdAt: string;
  updatedAt: string;
};

export type CharacterWithImages = CharacterBasic & {
  images: CharacterImageBasic[];
  storyLinks?: StoryCharacterWithStory[];
};

export type CharacterImageBasic = {
  id: number;
  characterId: number;
  imageUrl: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoryCharacterWithCharacter = {
  id: number;
  storyId: number;
  characterId: number;
  name: string;
  listed: boolean;
  order: number;
  createdAt: string;
  character: CharacterBasic & { images?: CharacterImageBasic[] };
};

export type StoryCharacterWithStory = {
  id: number;
  storyId: number;
  characterId: number;
  name: string;
  listed: boolean;
  order: number;
  story: { id: number; title: string };
};

export type UnitBasic = {
  id: number;
  storyId: number;
  order: number;
  color: string | null;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

export type UnitWithStory = UnitBasic & {
  story: {
    id: number;
    title: string;
    icon: string;
    category: string;
  };
};

export type QuizLevel =
  | "BEGINNER"
  | "BASIC"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "MASTER";

export type QuizBasic = {
  id: number;
  sourceType: "EPISODE" | "LESSON";
  sourceId: number;
  type: "SENTENCE_BUILD" | "SENTENCE_CLOZE_BUILD" | "SPEAK_REPEAT";
  level: QuizLevel;
  questionEnglish: string;
  questionKorean: string | null;
  description: string | null;
  order: number | null;
  data: Record<string, unknown> | null;
  isActive: boolean;
};

export type ReviewItemBasic = {
  id: number;
  episodeId: number;
  dialogueId: number;
  description: string | null;
  order: number;
  dialogue?: {
    id: number;
    englishText: string;
    koreanText: string;
    characterName: string | null;
    scene: { title: string };
  };
  sceneOrder?: number;
  dialogueOrder?: number;
};

export type EndingBasic = {
  id: number;
  episodeId: number;
  key: string;
  name: string;
  imageUrl: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type EndingWithRewards = EndingBasic & {
  rewards: EndingRewardBasic[];
};

/** 엔딩 탭: Reward (sourceType=ENDING) — API에서 endingId = sourceId */
export type EndingRewardBasic = {
  id: number;
  endingId: number;
  type:
    | "COIN"
    | "COUPON"
    | "CHARACTER_INVITE"
    | "XP"
    | "ITEM";
  description: string | null;
  payload: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** 에피소드 리워드: Reward (sourceType=EPISODE) — API에서 episodeId = sourceId */
export type EpisodeRewardBasic = Omit<EndingRewardBasic, "endingId"> & {
  episodeId: number;
};

/** 출석/회원가입 리워드 관리 페이지 */
export type AdminGlobalReward = {
  id: number;
  sourceType: "ATTENDANCE" | "SIGNUP";
  sourceId: number;
  type:
    | "COIN"
    | "COUPON"
    | "CHARACTER_INVITE"
    | "XP"
    | "ITEM";
  description: string | null;
  payload: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoticeType =
  | "GENERAL"
  | "BETA"
  | "EVENT"
  | "MAINTENANCE"
  | "UPDATE";

export type NoticeAdmin = {
  id: number;
  title: string;
  content: string;
  type: NoticeType;
  isPopup: boolean;
  isActive: boolean;
  version: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────
// PRODUCT & COLLECTION
// ─────────────────────────────────────────────

export type ProductType = "PLAY_EPISODE" | "COIN_PACK" | "SUBSCRIPTION";
export type CurrencyType = "COIN" | "KRW" | "USD";

export type ProductBasic = {
  id: number;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  type: ProductType;
  currency: CurrencyType;
  price: number;
  storeSku: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EpisodeForProduct = {
  id: number;
  title: string;
  koreanTitle: string | null;
  order: number;
  status: string;
  storyId: number | null;
  story: { id: number; title: string } | null;
};

export type EpisodeProductBasic = {
  id: number;
  episodeId: number;
  productId: number;
  episode: EpisodeForProduct;
};

export type ProductWithEpisodes = ProductBasic & {
  episodes: EpisodeProductBasic[];
  _count?: { purchases: number };
};

export type EpisodeWithProduct = EpisodeBasic & {
  episodeProducts: { product: ProductBasic }[];
  story?: { id: number; title: string } | null;
};

export type CollectionKey = "TOP" | "OTHER";

export type CollectionBasic = {
  id: number;
  key: CollectionKey;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  order: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CollectionProductBasic = {
  id: number;
  collectionId: number;
  productId: number;
  order: number;
  product: ProductBasic;
};

export type CollectionWithProducts = CollectionBasic & {
  products: CollectionProductBasic[];
  _count?: { products: number };
};

// ─────────────────────────────────────────────
// COUPON
// ─────────────────────────────────────────────

export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "DELETED";
export type CouponTargetType = "ALL" | "PRODUCT" | "PRODUCT_TYPE";
export type CouponBenefitType =
  | "FIXED_AMOUNT"
  | "PERCENTAGE"
  | "FREE_PRODUCT"
  | "FREE_PRODUCT_TYPE"
  | "COIN_REWARD";
export type UserCouponStatus = "AVAILABLE" | "USED" | "EXPIRED" | "CANCELED";
export type CouponUsageStatus = "APPLIED" | "CANCELED" | "RESTORED";

export type CouponBasic = {
  id: number;
  name: string;
  key: string | null;
  description: string | null;
  benefitType: CouponBenefitType;
  discountAmount: number | null;
  discountPercent: number | null;
  maxDiscountAmount: number | null;
  rewardCoinAmount: number | null;
  minPurchaseAmount: number | null;
  targetType: CouponTargetType;
  targetId: number | null;
  issuedCount: number;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  expiresInDays: number | null;
  isPublic: boolean;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
};

export type CouponCodeBasic = {
  id: number;
  couponId: number;
  code: string;
  assignedUserId: number | null;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser?: { id: number; name: string | null; email: string } | null;
};

export type UserCouponBasic = {
  id: number;
  userId: number;
  couponId: number;
  status: UserCouponStatus;
  issuedAt: string;
  usedAt: string | null;
  expiredAt: string | null;
  validFrom: string | null;
  validUntil: string | null;
  source: string | null;
  createdAt: string;
  user?: { id: number; name: string | null; email: string };
};

export type CouponWithCounts = CouponBasic & {
  _count?: { codes: number; userCoupons: number };
};
