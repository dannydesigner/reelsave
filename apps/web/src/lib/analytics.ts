/**
 * Google Analytics 4 Event Tracking
 * 
 * Use these helper functions to track custom events in your application.
 * Make sure to import this in client components only ('use client' directive).
 */

import { sendGAEvent } from '@next/third-parties/google';

/**
 * Track when a user initiates a video download
 */
export function trackVideoDownloadStart(platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube', url: string) {
  sendGAEvent({
    event: 'video_download_start',
    platform,
    url_length: url.length,
  });
}

/**
 * Track successful video download
 */
export function trackVideoDownloadSuccess(platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube', quality?: string) {
  sendGAEvent({
    event: 'video_download_success',
    platform,
    quality: quality || 'unknown',
  });
}

/**
 * Track failed video download
 */
export function trackVideoDownloadError(platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube', errorType: string) {
  sendGAEvent({
    event: 'video_download_error',
    platform,
    error_type: errorType,
  });
}

/**
 * Track URL paste in input field
 */
export function trackUrlPaste(platform?: string) {
  sendGAEvent({
    event: 'url_paste',
    platform: platform || 'unknown',
  });
}

/**
 * Track platform/social network selection
 */
export function trackPlatformSelect(platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube') {
  sendGAEvent({
    event: 'platform_select',
    platform,
  });
}

/**
 * Track when user views the about page
 */
export function trackAboutPageView() {
  sendGAEvent({
    event: 'about_page_view',
  });
}

/**
 * Track when user views privacy policy
 */
export function trackPrivacyPageView() {
  sendGAEvent({
    event: 'privacy_page_view',
  });
}

/**
 * Track when user views terms of service
 */
export function trackTermsPageView() {
  sendGAEvent({
    event: 'terms_page_view',
  });
}

/**
 * Track button clicks
 */
export function trackButtonClick(buttonName: string, location: string) {
  sendGAEvent({
    event: 'button_click',
    button_name: buttonName,
    location,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUse(featureName: string) {
  sendGAEvent({
    event: 'feature_use',
    feature_name: featureName,
  });
}

/**
 * Track user engagement (time spent on specific action)
 */
export function trackEngagement(category: string, label: string, value?: number) {
  sendGAEvent({
    event: 'user_engagement',
    category,
    label,
    value,
  });
}
