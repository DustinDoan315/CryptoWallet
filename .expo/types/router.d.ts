/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/add-account`; params?: Router.UnknownInputParams; } | { pathname: `/add-token`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/create-wallet` | `/create-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/generate-seed-phrase` | `/generate-seed-phrase`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/import-wallet` | `/import-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/secure-wallet` | `/secure-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/validate-seed-phrase` | `/validate-seed-phrase`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/validate-success` | `/validate-success`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/wallet-info` | `/wallet-info`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/onboarding` | `/onboarding`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/security-options` | `/security-options`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/wallet-setup` | `/wallet-setup`; params?: Router.UnknownInputParams; } | { pathname: `${'/(subs)'}/crypto-detail` | `/crypto-detail`; params?: Router.UnknownInputParams; } | { pathname: `${'/(subs)'}/crypto-search` | `/crypto-search`; params?: Router.UnknownInputParams; } | { pathname: `${'/(subs)'}/enhanced-crypto-chart` | `/enhanced-crypto-chart`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/exchange` | `/exchange`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/wallet` | `/wallet`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/add-account`; params?: Router.UnknownOutputParams; } | { pathname: `/add-token`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/create-wallet` | `/create-wallet`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/generate-seed-phrase` | `/generate-seed-phrase`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/import-wallet` | `/import-wallet`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/secure-wallet` | `/secure-wallet`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/validate-seed-phrase` | `/validate-seed-phrase`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/validate-success` | `/validate-success`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/wallet-info` | `/wallet-info`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(onboarding)'}/onboarding` | `/onboarding`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(onboarding)'}/security-options` | `/security-options`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(onboarding)'}/wallet-setup` | `/wallet-setup`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(subs)'}/crypto-detail` | `/crypto-detail`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(subs)'}/crypto-search` | `/crypto-search`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(subs)'}/enhanced-crypto-chart` | `/enhanced-crypto-chart`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/exchange` | `/exchange`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/wallet` | `/wallet`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/add-account${`?${string}` | `#${string}` | ''}` | `/add-token${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/create-wallet${`?${string}` | `#${string}` | ''}` | `/create-wallet${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/generate-seed-phrase${`?${string}` | `#${string}` | ''}` | `/generate-seed-phrase${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/import-wallet${`?${string}` | `#${string}` | ''}` | `/import-wallet${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/secure-wallet${`?${string}` | `#${string}` | ''}` | `/secure-wallet${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/validate-seed-phrase${`?${string}` | `#${string}` | ''}` | `/validate-seed-phrase${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/validate-success${`?${string}` | `#${string}` | ''}` | `/validate-success${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/wallet-info${`?${string}` | `#${string}` | ''}` | `/wallet-info${`?${string}` | `#${string}` | ''}` | `${'/(onboarding)'}/onboarding${`?${string}` | `#${string}` | ''}` | `/onboarding${`?${string}` | `#${string}` | ''}` | `${'/(onboarding)'}/security-options${`?${string}` | `#${string}` | ''}` | `/security-options${`?${string}` | `#${string}` | ''}` | `${'/(onboarding)'}/wallet-setup${`?${string}` | `#${string}` | ''}` | `/wallet-setup${`?${string}` | `#${string}` | ''}` | `${'/(subs)'}/crypto-detail${`?${string}` | `#${string}` | ''}` | `/crypto-detail${`?${string}` | `#${string}` | ''}` | `${'/(subs)'}/crypto-search${`?${string}` | `#${string}` | ''}` | `/crypto-search${`?${string}` | `#${string}` | ''}` | `${'/(subs)'}/enhanced-crypto-chart${`?${string}` | `#${string}` | ''}` | `/enhanced-crypto-chart${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/exchange${`?${string}` | `#${string}` | ''}` | `/exchange${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/wallet${`?${string}` | `#${string}` | ''}` | `/wallet${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/add-account`; params?: Router.UnknownInputParams; } | { pathname: `/add-token`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/create-wallet` | `/create-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/generate-seed-phrase` | `/generate-seed-phrase`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/import-wallet` | `/import-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/secure-wallet` | `/secure-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/validate-seed-phrase` | `/validate-seed-phrase`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/validate-success` | `/validate-success`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/wallet-info` | `/wallet-info`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/onboarding` | `/onboarding`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/security-options` | `/security-options`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/wallet-setup` | `/wallet-setup`; params?: Router.UnknownInputParams; } | { pathname: `${'/(subs)'}/crypto-detail` | `/crypto-detail`; params?: Router.UnknownInputParams; } | { pathname: `${'/(subs)'}/crypto-search` | `/crypto-search`; params?: Router.UnknownInputParams; } | { pathname: `${'/(subs)'}/enhanced-crypto-chart` | `/enhanced-crypto-chart`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/exchange` | `/exchange`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/wallet` | `/wallet`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
