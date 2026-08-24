import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from '@capacitor-community/admob';

const TEST_ANDROID_BANNER_ID = 'ca-app-pub-3940256099942544/9214589741';
const TEST_ANDROID_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const ADS_TEST_MODE = import.meta.env.VITE_ADMOB_TEST_MODE !== 'false';
const USE_REAL_IDS_ON_TEST_DEVICES =
  import.meta.env.VITE_ADMOB_USE_REAL_IDS_ON_TEST_DEVICES === 'true';

let sdkInitialized = false;
let adsReady = false;
let sdkInitializationPromise: Promise<boolean> | null = null;
let initializationPromise: Promise<boolean> | null = null;
let bannerCreated = false;
let bannerVisible = false;
let bannerMargin: number | null = null;
let interstitialReady = false;
let interstitialLoading = false;
let consentOperationQueue: Promise<void> = Promise.resolve();

function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

function getAdUnitId(kind: 'banner' | 'interstitial') {
  const fallback = kind === 'banner' ? TEST_ANDROID_BANNER_ID : TEST_ANDROID_INTERSTITIAL_ID;
  const envValue =
    kind === 'banner'
      ? import.meta.env.VITE_ADMOB_ANDROID_BANNER_ID
      : import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL_ID;

  if (ADS_TEST_MODE && !USE_REAL_IDS_ON_TEST_DEVICES) {
    return fallback;
  }

  if (typeof envValue === 'string' && envValue.trim()) {
    return envValue.trim();
  }

  return ADS_TEST_MODE ? fallback : null;
}

function runConsentOperation<T>(operation: () => Promise<T>) {
  const result = consentOperationQueue.then(operation, operation);
  consentOperationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function initializeAdMobSdk() {
  if (!isAndroidNative()) {
    return false;
  }

  if (sdkInitialized) {
    return true;
  }

  if (sdkInitializationPromise) {
    return sdkInitializationPromise;
  }

  sdkInitializationPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: ADS_TEST_MODE,
        maxAdContentRating: MaxAdContentRating.General,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });
      sdkInitialized = true;
      return true;
    } catch (error) {
      console.warn('AdMob SDK initialization failed.', error);
      return false;
    } finally {
      sdkInitializationPromise = null;
    }
  })();

  return sdkInitializationPromise;
}

async function canRequestAds() {
  return runConsentOperation(async () => {
    try {
      let consentInfo = await AdMob.requestConsentInfo();
      if (
        consentInfo.status === AdmobConsentStatus.REQUIRED &&
        consentInfo.isConsentFormAvailable
      ) {
        consentInfo = await AdMob.showConsentForm();
      }

      return consentInfo.canRequestAds;
    } catch (error) {
      console.warn(
        ADS_TEST_MODE
          ? 'AdMob consent unavailable; continuing with test ads only for this session.'
          : 'AdMob consent unavailable, ads disabled for this session.',
        error,
      );
      return ADS_TEST_MODE;
    }
  });
}

async function prepareInterstitialAd() {
  if (!adsReady || interstitialLoading || interstitialReady) {
    return;
  }

  const adId = getAdUnitId('interstitial');
  if (!adId) {
    console.warn('AdMob interstitial ID missing. Set VITE_ADMOB_ANDROID_INTERSTITIAL_ID.');
    return;
  }

  interstitialLoading = true;
  try {
    await AdMob.prepareInterstitial({
      adId,
      isTesting: ADS_TEST_MODE,
      immersiveMode: true,
      npa: true,
    });
    interstitialReady = true;
  } catch (error) {
    console.warn('AdMob interstitial failed to preload.', error);
  } finally {
    interstitialLoading = false;
  }
}

async function showPreparedInterstitial({ loadIfMissing }: { loadIfMissing: boolean }) {
  if (!(await initializeMobileAds())) {
    return;
  }

  try {
    if (!interstitialReady) {
      if (!loadIfMissing) {
        void prepareInterstitialAd();
        return;
      }

      await prepareInterstitialAd();
    }

    if (interstitialReady) {
      await AdMob.showInterstitial();
      interstitialReady = false;
      void prepareInterstitialAd();
    }
  } catch (error) {
    interstitialReady = false;
    console.warn('AdMob interstitial failed to show.', error);
    void prepareInterstitialAd();
  }
}

export async function initializeMobileAds() {
  if (!isAndroidNative()) {
    return false;
  }

  if (adsReady) {
    return true;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      if (!(await initializeAdMobSdk())) {
        return false;
      }

      if (!(await canRequestAds())) {
        return false;
      }

      adsReady = true;
      await prepareInterstitialAd();
      return true;
    } catch (error) {
      console.warn('AdMob initialization failed.', error);
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

export async function setMobileBannerVisible(
  visible: boolean,
  options: { margin?: number } = {},
) {
  if (!(await initializeMobileAds())) {
    return;
  }

  const adId = getAdUnitId('banner');
  if (!adId) {
    console.warn('AdMob banner ID missing. Set VITE_ADMOB_ANDROID_BANNER_ID.');
    return;
  }

  try {
    const nextMargin = options.margin ?? 0;

    if (visible) {
      if (bannerCreated && bannerMargin !== nextMargin) {
        await AdMob.removeBanner();
        bannerCreated = false;
        bannerVisible = false;
        bannerMargin = null;
      }

      if (bannerCreated) {
        await AdMob.resumeBanner();
      } else {
        await AdMob.showBanner({
          adId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: nextMargin,
          isTesting: ADS_TEST_MODE,
          npa: true,
        });
        bannerCreated = true;
        bannerMargin = nextMargin;
      }
      bannerVisible = true;
      return;
    }

    if (bannerCreated && bannerVisible) {
      await AdMob.hideBanner();
      bannerVisible = false;
    }
  } catch (error) {
    console.warn('AdMob banner visibility update failed.', error);
  }
}

export async function showSessionCompleteAd() {
  await showPreparedInterstitial({ loadIfMissing: true });
}

export async function showQuestionMilestoneAd() {
  await showPreparedInterstitial({ loadIfMissing: false });
}

export async function showMobileAdsPrivacyOptions() {
  if (!isAndroidNative()) {
    return;
  }

  if (!(await initializeAdMobSdk())) {
    return;
  }

  await runConsentOperation(async () => {
    try {
      await AdMob.requestConsentInfo();
    } catch (error) {
      console.warn('AdMob consent refresh failed; trying the cached privacy options.', error);
    }

    try {
      await AdMob.showPrivacyOptionsForm();
    } catch (error) {
      console.warn('AdMob privacy options unavailable.', error);
    }
  });
}
