/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from "graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: { input: any; output: any };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any };
};

export type AtlasPassiveSnapshot = {
  __typename?: "AtlasPassiveSnapshot";
  createdAtTimestamp: Scalars["DateTime"]["output"];
  hashes: Array<Scalars["Float"]["output"]>;
  league: Scalars["String"]["output"];
  source: Scalars["String"]["output"];
  systemSnapshotTimestamp: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type AtlasPassiveSnapshotResponse = {
  __typename?: "AtlasPassiveSnapshotResponse";
  results: Array<AtlasPassiveSnapshot>;
};

export type AtlasPassiveSnapshotSearch = {
  excludedHashes?: InputMaybe<Array<Scalars["String"]["input"]>>;
  includedHashes?: InputMaybe<Array<Scalars["String"]["input"]>>;
  league?: InputMaybe<Scalars["String"]["input"]>;
  timestampEndInclusive?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type CustomLadderGroup = {
  __typename?: "CustomLadderGroup";
  createdAtTimestamp: Scalars["DateTime"]["output"];
  id: Scalars["String"]["output"];
  members: Array<CustomLadderMember>;
  name: Scalars["String"]["output"];
  ownerUserId: Scalars["String"]["output"];
};

export type CustomLadderGroupInput = {
  id: Scalars["String"]["input"];
  members: Array<CustomLadderMemberInput>;
  name: Scalars["String"]["input"];
};

export type CustomLadderMember = {
  __typename?: "CustomLadderMember";
  poeProfileName: Scalars["String"]["output"];
  userId: Scalars["String"]["output"];
};

export type CustomLadderMemberInput = {
  poeProfileName: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type GenericAggregation = {
  __typename?: "GenericAggregation";
  values: Array<GenericIntKeyValue>;
};

export type GenericIntKeyValue = {
  __typename?: "GenericIntKeyValue";
  key?: Maybe<Scalars["String"]["output"]>;
  timestamp?: Maybe<Scalars["DateTime"]["output"]>;
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type GlobalSearch = {
  league: Scalars["String"]["input"];
  searchText: Scalars["String"]["input"];
};

export type GlobalSearchResponse = {
  __typename?: "GlobalSearchResponse";
  results: Array<GlobalSearchResponseEntry>;
};

export type GlobalSearchResponseEntry = {
  __typename?: "GlobalSearchResponseEntry";
  display: Scalars["String"]["output"];
  group: Scalars["String"]["output"];
  icon?: Maybe<Scalars["String"]["output"]>;
  target: Scalars["String"]["output"];
};

export type ItemGroup = {
  __typename?: "ItemGroup";
  baseType?: Maybe<Scalars["String"]["output"]>;
  createdAtTimestamp: Scalars["DateTime"]["output"];
  displayName?: Maybe<Scalars["String"]["output"]>;
  hashString: Scalars["String"]["output"];
  icon?: Maybe<Scalars["String"]["output"]>;
  inventoryMaxStackSize?: Maybe<Scalars["Float"]["output"]>;
  key: Scalars["String"]["output"];
  properties?: Maybe<Array<Scalars["JSONObject"]["output"]>>;
  tag: Scalars["String"]["output"];
};

export type ItemGroupListing = {
  __typename?: "ItemGroupListing";
  listedAtTimestamp: Scalars["DateTime"]["output"];
  listedValue: Scalars["Float"]["output"];
  quantity: Scalars["Float"]["output"];
};

export type LadderViewVectorRecord = {
  __typename?: "LadderViewVectorRecord";
  league: Scalars["String"]["output"];
  timestamp: Scalars["DateTime"]["output"];
};

export type LivePricingHistoryConfig = {
  itemGroupHashStrings: Array<Scalars["String"]["input"]>;
  league: Scalars["String"]["input"];
  minQuantities: Array<Scalars["Float"]["input"]>;
  types: Array<Scalars["String"]["input"]>;
};

export type LivePricingHistoryEntry = {
  __typename?: "LivePricingHistoryEntry";
  timestamp: Scalars["DateTime"]["output"];
  value: Scalars["Float"]["output"];
};

export type LivePricingHistoryGroup = {
  __typename?: "LivePricingHistoryGroup";
  itemGroup: ItemGroup;
  series: Array<LivePricingHistorySeries>;
};

export type LivePricingHistoryResult = {
  __typename?: "LivePricingHistoryResult";
  results: Array<LivePricingHistoryGroup>;
};

export type LivePricingHistorySeries = {
  __typename?: "LivePricingHistorySeries";
  entries: Array<LivePricingHistoryEntry>;
  stockRangeStartInclusive: Scalars["Float"]["output"];
  type: Scalars["String"]["output"];
};

export type LivePricingSimpleConfig = {
  itemGroupHashString: Scalars["String"]["input"];
  league: Scalars["String"]["input"];
  listingPercent?: InputMaybe<Scalars["Float"]["input"]>;
  quantity: Scalars["Float"]["input"];
};

export type LivePricingSimpleResult = {
  __typename?: "LivePricingSimpleResult";
  allListingsLength: Scalars["Float"]["output"];
  stockValuation?: Maybe<LivePricingValuation>;
  valuation?: Maybe<LivePricingValuation>;
};

export type LivePricingSummary = {
  __typename?: "LivePricingSummary";
  entries: Array<LivePricingSummaryEntry>;
};

export type LivePricingSummaryEntry = {
  __typename?: "LivePricingSummaryEntry";
  itemGroup: ItemGroup;
  stockValuation?: Maybe<LivePricingValuation>;
  valuation?: Maybe<LivePricingValuation>;
};

export type LivePricingSummarySearch = {
  itemGroupHashStrings?: InputMaybe<Array<Scalars["String"]["input"]>>;
  league: Scalars["String"]["input"];
  limit?: InputMaybe<Scalars["Float"]["input"]>;
  offSet?: InputMaybe<Scalars["Float"]["input"]>;
  quantityMin?: InputMaybe<Scalars["Float"]["input"]>;
  searchString?: InputMaybe<Scalars["String"]["input"]>;
  tag?: InputMaybe<Scalars["String"]["input"]>;
};

export type LivePricingValuation = {
  __typename?: "LivePricingValuation";
  listingPercent: Scalars["Float"]["output"];
  quantity: Scalars["Float"]["output"];
  validListings: Array<ItemGroupListing>;
  validListingsLength: Scalars["Float"]["output"];
  value: Scalars["Float"]["output"];
  valueIndex: Scalars["Float"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  deleteCustomLadderGroup: Scalars["Boolean"]["output"];
  deleteStashViewValueSnapshotSeries: Scalars["Boolean"]["output"];
  deleteTftOneClickMessage: Scalars["Boolean"]["output"];
  exchangeAuthCode: Scalars["String"]["output"];
  loginAs: Scalars["String"]["output"];
  routeChange: Scalars["Boolean"]["output"];
  stashViewOneClickMessage: Scalars["String"]["output"];
  stashViewOneClickPost: Scalars["Boolean"]["output"];
  stashViewRefreshTabs: Scalars["Boolean"]["output"];
  stashViewSnapshot: Scalars["String"]["output"];
  stashViewUpdateSnapshotRecord: Scalars["Boolean"]["output"];
  updateCustomLadderGroup: CustomLadderGroup;
  updateDiscordCode: Scalars["Boolean"]["output"];
  updatePatreonCode: Scalars["Boolean"]["output"];
  updatePreferenceListingPercent: Scalars["Boolean"]["output"];
  updateStashViewAutomaticSnapshotSettings: Scalars["Boolean"]["output"];
};

export type MutationDeleteCustomLadderGroupArgs = {
  groupId: Scalars["String"]["input"];
};

export type MutationDeleteTftOneClickMessageArgs = {
  messageId: Scalars["String"]["input"];
};

export type MutationExchangeAuthCodeArgs = {
  authCode: Scalars["String"]["input"];
};

export type MutationLoginAsArgs = {
  userId: Scalars["String"]["input"];
};

export type MutationRouteChangeArgs = {
  path: Scalars["String"]["input"];
  pathname: Scalars["String"]["input"];
};

export type MutationStashViewOneClickMessageArgs = {
  input: StashViewSettings;
};

export type MutationStashViewOneClickPostArgs = {
  input: StashViewSettings;
};

export type MutationStashViewRefreshTabsArgs = {
  league: Scalars["String"]["input"];
};

export type MutationStashViewSnapshotArgs = {
  input: StashViewSnapshotInput;
};

export type MutationStashViewUpdateSnapshotRecordArgs = {
  input: StashViewSnapshotRecordUpdateInput;
};

export type MutationUpdateCustomLadderGroupArgs = {
  group: CustomLadderGroupInput;
};

export type MutationUpdateDiscordCodeArgs = {
  code: Scalars["String"]["input"];
};

export type MutationUpdatePatreonCodeArgs = {
  code: Scalars["String"]["input"];
};

export type MutationUpdatePreferenceListingPercentArgs = {
  listingPercent: Scalars["Float"]["input"];
};

export type MutationUpdateStashViewAutomaticSnapshotSettingsArgs = {
  input: StashViewAutomaticSnapshotSettingsInput;
};

export type OneClickMessageHistory = {
  __typename?: "OneClickMessageHistory";
  channelId: Scalars["String"]["output"];
  exportSubType?: Maybe<Scalars["String"]["output"]>;
  exportType: Scalars["String"]["output"];
  messageId: Scalars["String"]["output"];
  rateLimitExpires: Scalars["DateTime"]["output"];
  timestamp: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type PassiveTreeConnection = {
  __typename?: "PassiveTreeConnection";
  curved: Scalars["Boolean"]["output"];
  fromNode: Scalars["String"]["output"];
  toNode: Scalars["String"]["output"];
};

export type PassiveTreeConstants = {
  __typename?: "PassiveTreeConstants";
  maxX: Scalars["Float"]["output"];
  maxY: Scalars["Float"]["output"];
  minX: Scalars["Float"]["output"];
  minY: Scalars["Float"]["output"];
  orbitRadii: Array<Scalars["Float"]["output"]>;
  skillsPerOrbit: Array<Scalars["Float"]["output"]>;
};

export type PassiveTreeNode = {
  __typename?: "PassiveTreeNode";
  activeEffectImage?: Maybe<Scalars["String"]["output"]>;
  activeIcon?: Maybe<Scalars["String"]["output"]>;
  ascendancyName?: Maybe<Scalars["String"]["output"]>;
  flavourText: Array<Scalars["String"]["output"]>;
  group: Scalars["Float"]["output"];
  hash: Scalars["String"]["output"];
  icon: Scalars["String"]["output"];
  in: Array<Scalars["String"]["output"]>;
  inactiveIcon?: Maybe<Scalars["String"]["output"]>;
  isJewelSocket?: Maybe<Scalars["Boolean"]["output"]>;
  isKeystone?: Maybe<Scalars["Boolean"]["output"]>;
  isMastery?: Maybe<Scalars["Boolean"]["output"]>;
  isMultipleChoiceOption?: Maybe<Scalars["Boolean"]["output"]>;
  isNotable?: Maybe<Scalars["Boolean"]["output"]>;
  masteryEffects?: Maybe<Array<Scalars["JSON"]["output"]>>;
  name: Scalars["String"]["output"];
  orbit: Scalars["Float"]["output"];
  orbitIndex: Scalars["Float"]["output"];
  out: Array<Scalars["String"]["output"]>;
  recipe: Array<Scalars["String"]["output"]>;
  reminderText: Array<Scalars["String"]["output"]>;
  size: Scalars["Float"]["output"];
  stats: Array<Scalars["String"]["output"]>;
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PassiveTreeResponse = {
  __typename?: "PassiveTreeResponse";
  allConnections?: Maybe<Array<PassiveTreeConnection>>;
  allNodes?: Maybe<Array<PassiveTreeNode>>;
  connectionMap: Scalars["JSON"]["output"];
  constants: PassiveTreeConstants;
  nodeMap: Scalars["JSON"]["output"];
};

export type PoeLeague = {
  __typename?: "PoeLeague";
  description: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  realm: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type PoeStashTab = {
  __typename?: "PoeStashTab";
  flatIndex?: Maybe<Scalars["Float"]["output"]>;
  id: Scalars["String"]["output"];
  index: Scalars["Float"]["output"];
  league: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  parent?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  userId: Scalars["String"]["output"];
};

export type Query = {
  __typename?: "Query";
  atlasPassiveSnapshotsByUser: AtlasPassiveSnapshotResponse;
  atlasPassiveTreeSnapshotPopularityAggregation: GenericAggregation;
  atlasTree: PassiveTreeResponse;
  checkTftMembership: Scalars["Boolean"]["output"];
  customLadderGroup: CustomLadderGroup;
  customLadderGroupsByOwner: Array<CustomLadderGroup>;
  globalSearch: GlobalSearchResponse;
  ladderViewVectorRecords: Array<LadderViewVectorRecord>;
  leagueActvityTimeseries: GenericAggregation;
  leagues: Array<PoeLeague>;
  livePriceSimple: LivePricingSimpleResult;
  livePricingHistory: LivePricingHistoryResult;
  livePricingSummarySearch: LivePricingSummary;
  myNotifications: Array<UserNotification>;
  myProfile: UserProfile;
  passiveTree: PassiveTreeResponse;
  poestackStats: Scalars["JSON"]["output"];
  profileByPoeProfileName: UserProfile;
  stashTabs: Array<PoeStashTab>;
  stashViewAutomaticSnapshotSettings: StashViewAutomaticSnapshotSettings;
  stashViewItemSummary: StashViewStashSummary;
  stashViewJobStat: StashViewJob;
  stashViewSnapshotRecords: Array<StashViewSnapshotRecord>;
  stashViewValueSnapshotSeries: Array<StashViewValueSnapshotSeries>;
  tftLiveListingSearch: Array<TftLiveListing>;
  tftLiveListings: Array<TftLiveListing>;
  tftOneClickMessageHistory: Array<OneClickMessageHistory>;
};

export type QueryAtlasPassiveSnapshotsByUserArgs = {
  timestampEndInclusive?: InputMaybe<Scalars["DateTime"]["input"]>;
  userId: Scalars["String"]["input"];
};

export type QueryAtlasPassiveTreeSnapshotPopularityAggregationArgs = {
  search: AtlasPassiveSnapshotSearch;
};

export type QueryAtlasTreeArgs = {
  passiveTreeVersion: Scalars["String"]["input"];
};

export type QueryCheckTftMembershipArgs = {
  forcePull?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryCustomLadderGroupArgs = {
  groupId: Scalars["String"]["input"];
};

export type QueryCustomLadderGroupsByOwnerArgs = {
  ownerId: Scalars["String"]["input"];
};

export type QueryGlobalSearchArgs = {
  search: GlobalSearch;
};

export type QueryLadderViewVectorRecordsArgs = {
  league: Scalars["String"]["input"];
};

export type QueryLivePriceSimpleArgs = {
  config: LivePricingSimpleConfig;
};

export type QueryLivePricingHistoryArgs = {
  config: LivePricingHistoryConfig;
};

export type QueryLivePricingSummarySearchArgs = {
  search: LivePricingSummarySearch;
};

export type QueryPassiveTreeArgs = {
  passiveTreeVersion: Scalars["String"]["input"];
};

export type QueryProfileByPoeProfileNameArgs = {
  poeProfileName: Scalars["String"]["input"];
};

export type QueryStashTabsArgs = {
  forcePull?: InputMaybe<Scalars["Boolean"]["input"]>;
  league: Scalars["String"]["input"];
};

export type QueryStashViewAutomaticSnapshotSettingsArgs = {
  league: Scalars["String"]["input"];
};

export type QueryStashViewJobStatArgs = {
  jobId: Scalars["String"]["input"];
};

export type QueryStashViewSnapshotRecordsArgs = {
  league: Scalars["String"]["input"];
};

export type QueryStashViewValueSnapshotSeriesArgs = {
  league: Scalars["String"]["input"];
};

export type QueryTftLiveListingSearchArgs = {
  search: TftLiveListingSearch;
};

export type StashViewAutomaticSnapshotSettings = {
  __typename?: "StashViewAutomaticSnapshotSettings";
  durationBetweenSnapshotsSeconds: Scalars["Float"]["output"];
  league: Scalars["String"]["output"];
  nextSnapshotTimestamp: Scalars["DateTime"]["output"];
  stashIds: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
};

export type StashViewAutomaticSnapshotSettingsInput = {
  durationBetweenSnapshotsSeconds: Scalars["Float"]["input"];
  league: Scalars["String"]["input"];
  stashIds: Array<Scalars["String"]["input"]>;
};

export type StashViewItemSummary = {
  __typename?: "StashViewItemSummary";
  icon?: Maybe<Scalars["String"]["output"]>;
  itemGroup?: Maybe<ItemGroup>;
  itemGroupHashString?: Maybe<Scalars["String"]["output"]>;
  itemGroupTag?: Maybe<Scalars["String"]["output"]>;
  itemId: Scalars["String"]["output"];
  league: Scalars["String"]["output"];
  quantity: Scalars["Float"]["output"];
  searchableString: Scalars["String"]["output"];
  stashId: Scalars["String"]["output"];
  totalValueChaos?: Maybe<Scalars["Float"]["output"]>;
  userId: Scalars["String"]["output"];
  valueChaos?: Maybe<Scalars["Float"]["output"]>;
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type StashViewJob = {
  __typename?: "StashViewJob";
  id: Scalars["String"]["output"];
  rateLimitEndTimestamp?: Maybe<Scalars["DateTime"]["output"]>;
  status: Scalars["String"]["output"];
  timestamp: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type StashViewSettings = {
  chaosToDivRate: Scalars["Float"]["input"];
  checkedTabIds: Array<Scalars["String"]["input"]>;
  checkedTags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  excludedItemGroupIds: Array<Scalars["String"]["input"]>;
  exporterListedValueMultipler: Scalars["Float"]["input"];
  ign?: InputMaybe<Scalars["String"]["input"]>;
  itemGroupValueOverrides: Scalars["JSONObject"]["input"];
  league: Scalars["String"]["input"];
  minItemQuantity?: InputMaybe<Scalars["Float"]["input"]>;
  minItemStackValue?: InputMaybe<Scalars["Float"]["input"]>;
  minItemValue?: InputMaybe<Scalars["Float"]["input"]>;
  searchString?: InputMaybe<Scalars["String"]["input"]>;
  selectedTabId?: InputMaybe<Scalars["String"]["input"]>;
  selectedValuationType?: InputMaybe<Scalars["String"]["input"]>;
  selectedView?: InputMaybe<Scalars["String"]["input"]>;
  tftSelectedCategory?: InputMaybe<Scalars["String"]["input"]>;
  tftSelectedSubCategory?: InputMaybe<Scalars["String"]["input"]>;
  valueOverridesEnabled: Scalars["Boolean"]["input"];
};

export type StashViewSnapshotInput = {
  league: Scalars["String"]["input"];
  stashIds: Array<Scalars["String"]["input"]>;
};

export type StashViewSnapshotRecord = {
  __typename?: "StashViewSnapshotRecord";
  favorited: Scalars["Boolean"]["output"];
  fixedValue?: Maybe<Scalars["Float"]["output"]>;
  league: Scalars["String"]["output"];
  lpStockValue?: Maybe<Scalars["Float"]["output"]>;
  lpValue?: Maybe<Scalars["Float"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  timestamp: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type StashViewSnapshotRecordUpdateInput = {
  favorited: Scalars["Boolean"]["input"];
  league: Scalars["String"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  timestamp: Scalars["DateTime"]["input"];
};

export type StashViewStashSummary = {
  __typename?: "StashViewStashSummary";
  itemGroups: Array<ItemGroup>;
  items: Array<StashViewItemSummary>;
};

export type StashViewValueSnapshotSeries = {
  __typename?: "StashViewValueSnapshotSeries";
  stashId: Scalars["String"]["output"];
  timestamps: Array<Scalars["DateTime"]["output"]>;
  values: Array<Scalars["Float"]["output"]>;
};

export type TftLiveListing = {
  __typename?: "TftLiveListing";
  body: Scalars["String"]["output"];
  channelId: Scalars["String"]["output"];
  delistedAtTimestamp?: Maybe<Scalars["DateTime"]["output"]>;
  messageId: Scalars["String"]["output"];
  properties: Scalars["JSONObject"]["output"];
  tag: Scalars["String"]["output"];
  updatedAtTimestamp: Scalars["DateTime"]["output"];
  userDiscordDisplayRole?: Maybe<Scalars["String"]["output"]>;
  userDiscordDisplayRoleColor?: Maybe<Scalars["String"]["output"]>;
  userDiscordHighestRole?: Maybe<Scalars["String"]["output"]>;
  userDiscordId: Scalars["String"]["output"];
  userDiscordName: Scalars["String"]["output"];
};

export type TftLiveListingSearch = {
  propertyFilterGroups: Array<TftLiveListingSearchPropertyGroup>;
  tag: Scalars["String"]["input"];
};

export type TftLiveListingSearchProperty = {
  key: Scalars["String"]["input"];
  type?: Scalars["String"]["input"];
  value: Scalars["String"]["input"];
};

export type TftLiveListingSearchPropertyGroup = {
  filters: Array<TftLiveListingSearchProperty>;
  type?: Scalars["String"]["input"];
};

export type UserNotification = {
  __typename?: "UserNotification";
  body?: Maybe<Scalars["String"]["output"]>;
  href?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["Float"]["output"];
  timestamp: Scalars["DateTime"]["output"];
  title?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  userId?: Maybe<Scalars["String"]["output"]>;
};

export type UserProfile = {
  __typename?: "UserProfile";
  createdAtTimestamp?: Maybe<Scalars["DateTime"]["output"]>;
  discordUserId?: Maybe<Scalars["String"]["output"]>;
  discordUsername?: Maybe<Scalars["String"]["output"]>;
  lastConnectedTimestamp?: Maybe<Scalars["DateTime"]["output"]>;
  oAuthTokenUpdatedAtTimestamp?: Maybe<Scalars["DateTime"]["output"]>;
  opaqueKey?: Maybe<Scalars["String"]["output"]>;
  patreonTier?: Maybe<Scalars["String"]["output"]>;
  patreonUserId?: Maybe<Scalars["String"]["output"]>;
  poeProfileName: Scalars["String"]["output"];
  preferences: Scalars["JSON"]["output"];
  roles: Array<Scalars["String"]["output"]>;
  userId: Scalars["String"]["output"];
};

export type GetUniquesQueryVariables = Exact<{
  search: LivePricingSummarySearch;
}>;

export type GetUniquesQuery = {
  __typename?: "Query";
  livePricingSummarySearch: {
    __typename?: "LivePricingSummary";
    entries: Array<{
      __typename?: "LivePricingSummaryEntry";
      itemGroup: { __typename?: "ItemGroup"; key: string; properties?: Array<any> | null };
      valuation?: { __typename?: "LivePricingValuation"; value: number } | null;
    }>;
  };
};

export const GetUniquesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetUniques" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "search" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "LivePricingSummarySearch" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "livePricingSummarySearch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: { kind: "Variable", name: { kind: "Name", value: "search" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "entries" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "itemGroup" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "key" } },
                            { kind: "Field", name: { kind: "Name", value: "properties" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "valuation" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "value" } }],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUniquesQuery, GetUniquesQueryVariables>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AtlasPassiveSnapshot: ResolverTypeWrapper<AtlasPassiveSnapshot>;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  AtlasPassiveSnapshotResponse: ResolverTypeWrapper<AtlasPassiveSnapshotResponse>;
  AtlasPassiveSnapshotSearch: AtlasPassiveSnapshotSearch;
  CustomLadderGroup: ResolverTypeWrapper<CustomLadderGroup>;
  CustomLadderGroupInput: CustomLadderGroupInput;
  CustomLadderMember: ResolverTypeWrapper<CustomLadderMember>;
  CustomLadderMemberInput: CustomLadderMemberInput;
  DateTime: ResolverTypeWrapper<Scalars["DateTime"]["output"]>;
  GenericAggregation: ResolverTypeWrapper<GenericAggregation>;
  GenericIntKeyValue: ResolverTypeWrapper<GenericIntKeyValue>;
  GlobalSearch: GlobalSearch;
  GlobalSearchResponse: ResolverTypeWrapper<GlobalSearchResponse>;
  GlobalSearchResponseEntry: ResolverTypeWrapper<GlobalSearchResponseEntry>;
  ItemGroup: ResolverTypeWrapper<ItemGroup>;
  ItemGroupListing: ResolverTypeWrapper<ItemGroupListing>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  JSONObject: ResolverTypeWrapper<Scalars["JSONObject"]["output"]>;
  LadderViewVectorRecord: ResolverTypeWrapper<LadderViewVectorRecord>;
  LivePricingHistoryConfig: LivePricingHistoryConfig;
  LivePricingHistoryEntry: ResolverTypeWrapper<LivePricingHistoryEntry>;
  LivePricingHistoryGroup: ResolverTypeWrapper<LivePricingHistoryGroup>;
  LivePricingHistoryResult: ResolverTypeWrapper<LivePricingHistoryResult>;
  LivePricingHistorySeries: ResolverTypeWrapper<LivePricingHistorySeries>;
  LivePricingSimpleConfig: LivePricingSimpleConfig;
  LivePricingSimpleResult: ResolverTypeWrapper<LivePricingSimpleResult>;
  LivePricingSummary: ResolverTypeWrapper<LivePricingSummary>;
  LivePricingSummaryEntry: ResolverTypeWrapper<LivePricingSummaryEntry>;
  LivePricingSummarySearch: LivePricingSummarySearch;
  LivePricingValuation: ResolverTypeWrapper<LivePricingValuation>;
  Mutation: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  OneClickMessageHistory: ResolverTypeWrapper<OneClickMessageHistory>;
  PassiveTreeConnection: ResolverTypeWrapper<PassiveTreeConnection>;
  PassiveTreeConstants: ResolverTypeWrapper<PassiveTreeConstants>;
  PassiveTreeNode: ResolverTypeWrapper<PassiveTreeNode>;
  PassiveTreeResponse: ResolverTypeWrapper<PassiveTreeResponse>;
  PoeLeague: ResolverTypeWrapper<PoeLeague>;
  PoeStashTab: ResolverTypeWrapper<PoeStashTab>;
  Query: ResolverTypeWrapper<{}>;
  StashViewAutomaticSnapshotSettings: ResolverTypeWrapper<StashViewAutomaticSnapshotSettings>;
  StashViewAutomaticSnapshotSettingsInput: StashViewAutomaticSnapshotSettingsInput;
  StashViewItemSummary: ResolverTypeWrapper<StashViewItemSummary>;
  StashViewJob: ResolverTypeWrapper<StashViewJob>;
  StashViewSettings: StashViewSettings;
  StashViewSnapshotInput: StashViewSnapshotInput;
  StashViewSnapshotRecord: ResolverTypeWrapper<StashViewSnapshotRecord>;
  StashViewSnapshotRecordUpdateInput: StashViewSnapshotRecordUpdateInput;
  StashViewStashSummary: ResolverTypeWrapper<StashViewStashSummary>;
  StashViewValueSnapshotSeries: ResolverTypeWrapper<StashViewValueSnapshotSeries>;
  TftLiveListing: ResolverTypeWrapper<TftLiveListing>;
  TftLiveListingSearch: TftLiveListingSearch;
  TftLiveListingSearchProperty: TftLiveListingSearchProperty;
  TftLiveListingSearchPropertyGroup: TftLiveListingSearchPropertyGroup;
  UserNotification: ResolverTypeWrapper<UserNotification>;
  UserProfile: ResolverTypeWrapper<UserProfile>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AtlasPassiveSnapshot: AtlasPassiveSnapshot;
  Float: Scalars["Float"]["output"];
  String: Scalars["String"]["output"];
  AtlasPassiveSnapshotResponse: AtlasPassiveSnapshotResponse;
  AtlasPassiveSnapshotSearch: AtlasPassiveSnapshotSearch;
  CustomLadderGroup: CustomLadderGroup;
  CustomLadderGroupInput: CustomLadderGroupInput;
  CustomLadderMember: CustomLadderMember;
  CustomLadderMemberInput: CustomLadderMemberInput;
  DateTime: Scalars["DateTime"]["output"];
  GenericAggregation: GenericAggregation;
  GenericIntKeyValue: GenericIntKeyValue;
  GlobalSearch: GlobalSearch;
  GlobalSearchResponse: GlobalSearchResponse;
  GlobalSearchResponseEntry: GlobalSearchResponseEntry;
  ItemGroup: ItemGroup;
  ItemGroupListing: ItemGroupListing;
  JSON: Scalars["JSON"]["output"];
  JSONObject: Scalars["JSONObject"]["output"];
  LadderViewVectorRecord: LadderViewVectorRecord;
  LivePricingHistoryConfig: LivePricingHistoryConfig;
  LivePricingHistoryEntry: LivePricingHistoryEntry;
  LivePricingHistoryGroup: LivePricingHistoryGroup;
  LivePricingHistoryResult: LivePricingHistoryResult;
  LivePricingHistorySeries: LivePricingHistorySeries;
  LivePricingSimpleConfig: LivePricingSimpleConfig;
  LivePricingSimpleResult: LivePricingSimpleResult;
  LivePricingSummary: LivePricingSummary;
  LivePricingSummaryEntry: LivePricingSummaryEntry;
  LivePricingSummarySearch: LivePricingSummarySearch;
  LivePricingValuation: LivePricingValuation;
  Mutation: {};
  Boolean: Scalars["Boolean"]["output"];
  OneClickMessageHistory: OneClickMessageHistory;
  PassiveTreeConnection: PassiveTreeConnection;
  PassiveTreeConstants: PassiveTreeConstants;
  PassiveTreeNode: PassiveTreeNode;
  PassiveTreeResponse: PassiveTreeResponse;
  PoeLeague: PoeLeague;
  PoeStashTab: PoeStashTab;
  Query: {};
  StashViewAutomaticSnapshotSettings: StashViewAutomaticSnapshotSettings;
  StashViewAutomaticSnapshotSettingsInput: StashViewAutomaticSnapshotSettingsInput;
  StashViewItemSummary: StashViewItemSummary;
  StashViewJob: StashViewJob;
  StashViewSettings: StashViewSettings;
  StashViewSnapshotInput: StashViewSnapshotInput;
  StashViewSnapshotRecord: StashViewSnapshotRecord;
  StashViewSnapshotRecordUpdateInput: StashViewSnapshotRecordUpdateInput;
  StashViewStashSummary: StashViewStashSummary;
  StashViewValueSnapshotSeries: StashViewValueSnapshotSeries;
  TftLiveListing: TftLiveListing;
  TftLiveListingSearch: TftLiveListingSearch;
  TftLiveListingSearchProperty: TftLiveListingSearchProperty;
  TftLiveListingSearchPropertyGroup: TftLiveListingSearchPropertyGroup;
  UserNotification: UserNotification;
  UserProfile: UserProfile;
};

export type AtlasPassiveSnapshotResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["AtlasPassiveSnapshot"] = ResolversParentTypes["AtlasPassiveSnapshot"],
> = {
  createdAtTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  hashes?: Resolver<Array<ResolversTypes["Float"]>, ParentType, ContextType>;
  league?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  source?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  systemSnapshotTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AtlasPassiveSnapshotResponseResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["AtlasPassiveSnapshotResponse"] = ResolversParentTypes["AtlasPassiveSnapshotResponse"],
> = {
  results?: Resolver<Array<ResolversTypes["AtlasPassiveSnapshot"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CustomLadderGroupResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["CustomLadderGroup"] = ResolversParentTypes["CustomLadderGroup"],
> = {
  createdAtTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes["CustomLadderMember"]>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  ownerUserId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CustomLadderMemberResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["CustomLadderMember"] = ResolversParentTypes["CustomLadderMember"],
> = {
  poeProfileName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
  name: "DateTime";
}

export type GenericAggregationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["GenericAggregation"] = ResolversParentTypes["GenericAggregation"],
> = {
  values?: Resolver<Array<ResolversTypes["GenericIntKeyValue"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericIntKeyValueResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["GenericIntKeyValue"] = ResolversParentTypes["GenericIntKeyValue"],
> = {
  key?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GlobalSearchResponseResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["GlobalSearchResponse"] = ResolversParentTypes["GlobalSearchResponse"],
> = {
  results?: Resolver<Array<ResolversTypes["GlobalSearchResponseEntry"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GlobalSearchResponseEntryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["GlobalSearchResponseEntry"] = ResolversParentTypes["GlobalSearchResponseEntry"],
> = {
  display?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  group?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  target?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemGroupResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ItemGroup"] = ResolversParentTypes["ItemGroup"],
> = {
  baseType?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  createdAtTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  hashString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  inventoryMaxStackSize?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  properties?: Resolver<Maybe<Array<ResolversTypes["JSONObject"]>>, ParentType, ContextType>;
  tag?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ItemGroupListingResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ItemGroupListing"] = ResolversParentTypes["ItemGroupListing"],
> = {
  listedAtTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  listedValue?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
  name: "JSON";
}

export interface JsonObjectScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSONObject"], any> {
  name: "JSONObject";
}

export type LadderViewVectorRecordResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LadderViewVectorRecord"] = ResolversParentTypes["LadderViewVectorRecord"],
> = {
  league?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingHistoryEntryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingHistoryEntry"] = ResolversParentTypes["LivePricingHistoryEntry"],
> = {
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingHistoryGroupResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingHistoryGroup"] = ResolversParentTypes["LivePricingHistoryGroup"],
> = {
  itemGroup?: Resolver<ResolversTypes["ItemGroup"], ParentType, ContextType>;
  series?: Resolver<Array<ResolversTypes["LivePricingHistorySeries"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingHistoryResultResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingHistoryResult"] = ResolversParentTypes["LivePricingHistoryResult"],
> = {
  results?: Resolver<Array<ResolversTypes["LivePricingHistoryGroup"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingHistorySeriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingHistorySeries"] = ResolversParentTypes["LivePricingHistorySeries"],
> = {
  entries?: Resolver<Array<ResolversTypes["LivePricingHistoryEntry"]>, ParentType, ContextType>;
  stockRangeStartInclusive?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingSimpleResultResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingSimpleResult"] = ResolversParentTypes["LivePricingSimpleResult"],
> = {
  allListingsLength?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  stockValuation?: Resolver<Maybe<ResolversTypes["LivePricingValuation"]>, ParentType, ContextType>;
  valuation?: Resolver<Maybe<ResolversTypes["LivePricingValuation"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingSummaryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingSummary"] = ResolversParentTypes["LivePricingSummary"],
> = {
  entries?: Resolver<Array<ResolversTypes["LivePricingSummaryEntry"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingSummaryEntryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingSummaryEntry"] = ResolversParentTypes["LivePricingSummaryEntry"],
> = {
  itemGroup?: Resolver<ResolversTypes["ItemGroup"], ParentType, ContextType>;
  stockValuation?: Resolver<Maybe<ResolversTypes["LivePricingValuation"]>, ParentType, ContextType>;
  valuation?: Resolver<Maybe<ResolversTypes["LivePricingValuation"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LivePricingValuationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LivePricingValuation"] = ResolversParentTypes["LivePricingValuation"],
> = {
  listingPercent?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  validListings?: Resolver<Array<ResolversTypes["ItemGroupListing"]>, ParentType, ContextType>;
  validListingsLength?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  value?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  valueIndex?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = {
  deleteCustomLadderGroup?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteCustomLadderGroupArgs, "groupId">
  >;
  deleteStashViewValueSnapshotSeries?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  deleteTftOneClickMessage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTftOneClickMessageArgs, "messageId">
  >;
  exchangeAuthCode?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<MutationExchangeAuthCodeArgs, "authCode">
  >;
  loginAs?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<MutationLoginAsArgs, "userId">
  >;
  routeChange?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationRouteChangeArgs, "path" | "pathname">
  >;
  stashViewOneClickMessage?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<MutationStashViewOneClickMessageArgs, "input">
  >;
  stashViewOneClickPost?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationStashViewOneClickPostArgs, "input">
  >;
  stashViewRefreshTabs?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationStashViewRefreshTabsArgs, "league">
  >;
  stashViewSnapshot?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType,
    RequireFields<MutationStashViewSnapshotArgs, "input">
  >;
  stashViewUpdateSnapshotRecord?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationStashViewUpdateSnapshotRecordArgs, "input">
  >;
  updateCustomLadderGroup?: Resolver<
    ResolversTypes["CustomLadderGroup"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCustomLadderGroupArgs, "group">
  >;
  updateDiscordCode?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateDiscordCodeArgs, "code">
  >;
  updatePatreonCode?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePatreonCodeArgs, "code">
  >;
  updatePreferenceListingPercent?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePreferenceListingPercentArgs, "listingPercent">
  >;
  updateStashViewAutomaticSnapshotSettings?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateStashViewAutomaticSnapshotSettingsArgs, "input">
  >;
};

export type OneClickMessageHistoryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["OneClickMessageHistory"] = ResolversParentTypes["OneClickMessageHistory"],
> = {
  channelId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  exportSubType?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  exportType?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  messageId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  rateLimitExpires?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PassiveTreeConnectionResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["PassiveTreeConnection"] = ResolversParentTypes["PassiveTreeConnection"],
> = {
  curved?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  fromNode?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  toNode?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PassiveTreeConstantsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["PassiveTreeConstants"] = ResolversParentTypes["PassiveTreeConstants"],
> = {
  maxX?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  maxY?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  minX?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  minY?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  orbitRadii?: Resolver<Array<ResolversTypes["Float"]>, ParentType, ContextType>;
  skillsPerOrbit?: Resolver<Array<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PassiveTreeNodeResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["PassiveTreeNode"] = ResolversParentTypes["PassiveTreeNode"],
> = {
  activeEffectImage?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  activeIcon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  ascendancyName?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  flavourText?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  group?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  in?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  inactiveIcon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  isJewelSocket?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  isKeystone?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  isMastery?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  isMultipleChoiceOption?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  isNotable?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  masteryEffects?: Resolver<Maybe<Array<ResolversTypes["JSON"]>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  orbit?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  orbitIndex?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  out?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  recipe?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  reminderText?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  size?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  stats?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  x?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  y?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PassiveTreeResponseResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["PassiveTreeResponse"] = ResolversParentTypes["PassiveTreeResponse"],
> = {
  allConnections?: Resolver<
    Maybe<Array<ResolversTypes["PassiveTreeConnection"]>>,
    ParentType,
    ContextType
  >;
  allNodes?: Resolver<Maybe<Array<ResolversTypes["PassiveTreeNode"]>>, ParentType, ContextType>;
  connectionMap?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  constants?: Resolver<ResolversTypes["PassiveTreeConstants"], ParentType, ContextType>;
  nodeMap?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PoeLeagueResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["PoeLeague"] = ResolversParentTypes["PoeLeague"],
> = {
  description?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  realm?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  url?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PoeStashTabResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["PoeStashTab"] = ResolversParentTypes["PoeStashTab"],
> = {
  flatIndex?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  index?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  league?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  atlasPassiveSnapshotsByUser?: Resolver<
    ResolversTypes["AtlasPassiveSnapshotResponse"],
    ParentType,
    ContextType,
    RequireFields<QueryAtlasPassiveSnapshotsByUserArgs, "userId">
  >;
  atlasPassiveTreeSnapshotPopularityAggregation?: Resolver<
    ResolversTypes["GenericAggregation"],
    ParentType,
    ContextType,
    RequireFields<QueryAtlasPassiveTreeSnapshotPopularityAggregationArgs, "search">
  >;
  atlasTree?: Resolver<
    ResolversTypes["PassiveTreeResponse"],
    ParentType,
    ContextType,
    RequireFields<QueryAtlasTreeArgs, "passiveTreeVersion">
  >;
  checkTftMembership?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    Partial<QueryCheckTftMembershipArgs>
  >;
  customLadderGroup?: Resolver<
    ResolversTypes["CustomLadderGroup"],
    ParentType,
    ContextType,
    RequireFields<QueryCustomLadderGroupArgs, "groupId">
  >;
  customLadderGroupsByOwner?: Resolver<
    Array<ResolversTypes["CustomLadderGroup"]>,
    ParentType,
    ContextType,
    RequireFields<QueryCustomLadderGroupsByOwnerArgs, "ownerId">
  >;
  globalSearch?: Resolver<
    ResolversTypes["GlobalSearchResponse"],
    ParentType,
    ContextType,
    RequireFields<QueryGlobalSearchArgs, "search">
  >;
  ladderViewVectorRecords?: Resolver<
    Array<ResolversTypes["LadderViewVectorRecord"]>,
    ParentType,
    ContextType,
    RequireFields<QueryLadderViewVectorRecordsArgs, "league">
  >;
  leagueActvityTimeseries?: Resolver<ResolversTypes["GenericAggregation"], ParentType, ContextType>;
  leagues?: Resolver<Array<ResolversTypes["PoeLeague"]>, ParentType, ContextType>;
  livePriceSimple?: Resolver<
    ResolversTypes["LivePricingSimpleResult"],
    ParentType,
    ContextType,
    RequireFields<QueryLivePriceSimpleArgs, "config">
  >;
  livePricingHistory?: Resolver<
    ResolversTypes["LivePricingHistoryResult"],
    ParentType,
    ContextType,
    RequireFields<QueryLivePricingHistoryArgs, "config">
  >;
  livePricingSummarySearch?: Resolver<
    ResolversTypes["LivePricingSummary"],
    ParentType,
    ContextType,
    RequireFields<QueryLivePricingSummarySearchArgs, "search">
  >;
  myNotifications?: Resolver<Array<ResolversTypes["UserNotification"]>, ParentType, ContextType>;
  myProfile?: Resolver<ResolversTypes["UserProfile"], ParentType, ContextType>;
  passiveTree?: Resolver<
    ResolversTypes["PassiveTreeResponse"],
    ParentType,
    ContextType,
    RequireFields<QueryPassiveTreeArgs, "passiveTreeVersion">
  >;
  poestackStats?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  profileByPoeProfileName?: Resolver<
    ResolversTypes["UserProfile"],
    ParentType,
    ContextType,
    RequireFields<QueryProfileByPoeProfileNameArgs, "poeProfileName">
  >;
  stashTabs?: Resolver<
    Array<ResolversTypes["PoeStashTab"]>,
    ParentType,
    ContextType,
    RequireFields<QueryStashTabsArgs, "league">
  >;
  stashViewAutomaticSnapshotSettings?: Resolver<
    ResolversTypes["StashViewAutomaticSnapshotSettings"],
    ParentType,
    ContextType,
    RequireFields<QueryStashViewAutomaticSnapshotSettingsArgs, "league">
  >;
  stashViewItemSummary?: Resolver<ResolversTypes["StashViewStashSummary"], ParentType, ContextType>;
  stashViewJobStat?: Resolver<
    ResolversTypes["StashViewJob"],
    ParentType,
    ContextType,
    RequireFields<QueryStashViewJobStatArgs, "jobId">
  >;
  stashViewSnapshotRecords?: Resolver<
    Array<ResolversTypes["StashViewSnapshotRecord"]>,
    ParentType,
    ContextType,
    RequireFields<QueryStashViewSnapshotRecordsArgs, "league">
  >;
  stashViewValueSnapshotSeries?: Resolver<
    Array<ResolversTypes["StashViewValueSnapshotSeries"]>,
    ParentType,
    ContextType,
    RequireFields<QueryStashViewValueSnapshotSeriesArgs, "league">
  >;
  tftLiveListingSearch?: Resolver<
    Array<ResolversTypes["TftLiveListing"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTftLiveListingSearchArgs, "search">
  >;
  tftLiveListings?: Resolver<Array<ResolversTypes["TftLiveListing"]>, ParentType, ContextType>;
  tftOneClickMessageHistory?: Resolver<
    Array<ResolversTypes["OneClickMessageHistory"]>,
    ParentType,
    ContextType
  >;
};

export type StashViewAutomaticSnapshotSettingsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["StashViewAutomaticSnapshotSettings"] = ResolversParentTypes["StashViewAutomaticSnapshotSettings"],
> = {
  durationBetweenSnapshotsSeconds?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  league?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  nextSnapshotTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  stashIds?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StashViewItemSummaryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["StashViewItemSummary"] = ResolversParentTypes["StashViewItemSummary"],
> = {
  icon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  itemGroup?: Resolver<Maybe<ResolversTypes["ItemGroup"]>, ParentType, ContextType>;
  itemGroupHashString?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  itemGroupTag?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  itemId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  league?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  searchableString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stashId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  totalValueChaos?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  valueChaos?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  x?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  y?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StashViewJobResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["StashViewJob"] = ResolversParentTypes["StashViewJob"],
> = {
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  rateLimitEndTimestamp?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StashViewSnapshotRecordResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["StashViewSnapshotRecord"] = ResolversParentTypes["StashViewSnapshotRecord"],
> = {
  favorited?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  fixedValue?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  league?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  lpStockValue?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  lpValue?: Resolver<Maybe<ResolversTypes["Float"]>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StashViewStashSummaryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["StashViewStashSummary"] = ResolversParentTypes["StashViewStashSummary"],
> = {
  itemGroups?: Resolver<Array<ResolversTypes["ItemGroup"]>, ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes["StashViewItemSummary"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StashViewValueSnapshotSeriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["StashViewValueSnapshotSeries"] = ResolversParentTypes["StashViewValueSnapshotSeries"],
> = {
  stashId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  timestamps?: Resolver<Array<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes["Float"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TftLiveListingResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["TftLiveListing"] = ResolversParentTypes["TftLiveListing"],
> = {
  body?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  channelId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  delistedAtTimestamp?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  messageId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  properties?: Resolver<ResolversTypes["JSONObject"], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updatedAtTimestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  userDiscordDisplayRole?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  userDiscordDisplayRoleColor?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  userDiscordHighestRole?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  userDiscordId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  userDiscordName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserNotificationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["UserNotification"] = ResolversParentTypes["UserNotification"],
> = {
  body?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  href?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserProfileResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["UserProfile"] = ResolversParentTypes["UserProfile"],
> = {
  createdAtTimestamp?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  discordUserId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  discordUsername?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  lastConnectedTimestamp?: Resolver<Maybe<ResolversTypes["DateTime"]>, ParentType, ContextType>;
  oAuthTokenUpdatedAtTimestamp?: Resolver<
    Maybe<ResolversTypes["DateTime"]>,
    ParentType,
    ContextType
  >;
  opaqueKey?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  patreonTier?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  patreonUserId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  poeProfileName?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  preferences?: Resolver<ResolversTypes["JSON"], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes["String"]>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AtlasPassiveSnapshot?: AtlasPassiveSnapshotResolvers<ContextType>;
  AtlasPassiveSnapshotResponse?: AtlasPassiveSnapshotResponseResolvers<ContextType>;
  CustomLadderGroup?: CustomLadderGroupResolvers<ContextType>;
  CustomLadderMember?: CustomLadderMemberResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  GenericAggregation?: GenericAggregationResolvers<ContextType>;
  GenericIntKeyValue?: GenericIntKeyValueResolvers<ContextType>;
  GlobalSearchResponse?: GlobalSearchResponseResolvers<ContextType>;
  GlobalSearchResponseEntry?: GlobalSearchResponseEntryResolvers<ContextType>;
  ItemGroup?: ItemGroupResolvers<ContextType>;
  ItemGroupListing?: ItemGroupListingResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  LadderViewVectorRecord?: LadderViewVectorRecordResolvers<ContextType>;
  LivePricingHistoryEntry?: LivePricingHistoryEntryResolvers<ContextType>;
  LivePricingHistoryGroup?: LivePricingHistoryGroupResolvers<ContextType>;
  LivePricingHistoryResult?: LivePricingHistoryResultResolvers<ContextType>;
  LivePricingHistorySeries?: LivePricingHistorySeriesResolvers<ContextType>;
  LivePricingSimpleResult?: LivePricingSimpleResultResolvers<ContextType>;
  LivePricingSummary?: LivePricingSummaryResolvers<ContextType>;
  LivePricingSummaryEntry?: LivePricingSummaryEntryResolvers<ContextType>;
  LivePricingValuation?: LivePricingValuationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OneClickMessageHistory?: OneClickMessageHistoryResolvers<ContextType>;
  PassiveTreeConnection?: PassiveTreeConnectionResolvers<ContextType>;
  PassiveTreeConstants?: PassiveTreeConstantsResolvers<ContextType>;
  PassiveTreeNode?: PassiveTreeNodeResolvers<ContextType>;
  PassiveTreeResponse?: PassiveTreeResponseResolvers<ContextType>;
  PoeLeague?: PoeLeagueResolvers<ContextType>;
  PoeStashTab?: PoeStashTabResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StashViewAutomaticSnapshotSettings?: StashViewAutomaticSnapshotSettingsResolvers<ContextType>;
  StashViewItemSummary?: StashViewItemSummaryResolvers<ContextType>;
  StashViewJob?: StashViewJobResolvers<ContextType>;
  StashViewSnapshotRecord?: StashViewSnapshotRecordResolvers<ContextType>;
  StashViewStashSummary?: StashViewStashSummaryResolvers<ContextType>;
  StashViewValueSnapshotSeries?: StashViewValueSnapshotSeriesResolvers<ContextType>;
  TftLiveListing?: TftLiveListingResolvers<ContextType>;
  UserNotification?: UserNotificationResolvers<ContextType>;
  UserProfile?: UserProfileResolvers<ContextType>;
};
