/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/create-wallet` | `/create-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/import-wallet` | `/import-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/security-options` | `/security-options`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/wallet-setup` | `/wallet-setup`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/explore` | `/explore`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/create-wallet` | `/create-wallet`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/import-wallet` | `/import-wallet`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(onboarding)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(onboarding)'}/security-options` | `/security-options`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(onboarding)'}/wallet-setup` | `/wallet-setup`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/explore` | `/explore`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/create-wallet${`?${string}` | `#${string}` | ''}` | `/create-wallet${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/import-wallet${`?${string}` | `#${string}` | ''}` | `/import-wallet${`?${string}` | `#${string}` | ''}` | `${'/(onboarding)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(onboarding)'}/security-options${`?${string}` | `#${string}` | ''}` | `/security-options${`?${string}` | `#${string}` | ''}` | `${'/(onboarding)'}/wallet-setup${`?${string}` | `#${string}` | ''}` | `/wallet-setup${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/explore${`?${string}` | `#${string}` | ''}` | `/explore${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/create-wallet` | `/create-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/import-wallet` | `/import-wallet`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/security-options` | `/security-options`; params?: Router.UnknownInputParams; } | { pathname: `${'/(onboarding)'}/wallet-setup` | `/wallet-setup`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/explore` | `/explore`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
