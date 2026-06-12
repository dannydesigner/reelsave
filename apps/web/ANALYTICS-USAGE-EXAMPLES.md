# Google Analytics Usage Examples

## How to Track Custom Events

The analytics helper functions are in `src/lib/analytics.ts`. Use them in your client components to track user interactions.

---

## Example 1: Track Video Download in Form Component

```typescript
'use client';

import { useState } from 'react';
import { trackVideoDownloadStart, trackVideoDownloadSuccess, trackVideoDownloadError } from '@/lib/analytics';

export function VideoDownloadForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const detectPlatform = (url: string) => {
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('youtube.com')) return 'youtube';
    return null;
  };

  const handleDownload = async () => {
    const platform = detectPlatform(url);
    if (!platform) return;

    // Track download start
    trackVideoDownloadStart(platform, url);

    try {
      setLoading(true);
      const response = await fetch('/api/download', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        // Track success
        trackVideoDownloadSuccess(platform, 'hd');
      } else {
        // Track error
        trackVideoDownloadError(platform, 'api_error');
      }
    } catch (error) {
      // Track error
      trackVideoDownloadError(platform, 'network_error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleDownload(); }}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste video URL here"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Downloading...' : 'Download'}
      </button>
    </form>
  );
}
```

---

## Example 2: Track URL Paste Event

```typescript
'use client';

import { trackUrlPaste } from '@/lib/analytics';

export function UrlInput() {
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = e.clipboardData.getData('text');
    
    // Detect platform from URL
    let platform = 'unknown';
    if (pastedUrl.includes('tiktok.com')) platform = 'tiktok';
    if (pastedUrl.includes('instagram.com')) platform = 'instagram';
    if (pastedUrl.includes('facebook.com')) platform = 'facebook';
    
    // Track the paste event
    trackUrlPaste(platform);
  };

  return (
    <input
      type="text"
      onPaste={handlePaste}
      placeholder="Paste video URL"
    />
  );
}
```

---

## Example 3: Track Button Clicks

```typescript
'use client';

import { trackButtonClick } from '@/lib/analytics';

export function Header() {
  return (
    <header>
      <button
        onClick={() => trackButtonClick('home_cta', 'header')}
      >
        Get Started
      </button>
      
      <button
        onClick={() => trackButtonClick('about', 'header')}
      >
        About
      </button>
    </header>
  );
}
```

---

## Example 4: Track Page Views (Client Component)

If you need to track custom page views from a client component:

```typescript
'use client';

import { useEffect } from 'react';
import { trackAboutPageView } from '@/lib/analytics';

export default function AboutPage() {
  useEffect(() => {
    // Track custom page view event
    trackAboutPageView();
  }, []);

  return (
    <div>
      <h1>About ReelSave</h1>
      {/* Page content */}
    </div>
  );
}
```

---

## Example 5: Track Platform Selection

```typescript
'use client';

import { trackPlatformSelect } from '@/lib/analytics';

export function PlatformSelector() {
  const platforms = ['tiktok', 'instagram', 'facebook', 'youtube'] as const;

  return (
    <div>
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => trackPlatformSelect(platform)}
        >
          {platform}
        </button>
      ))}
    </div>
  );
}
```

---

## Example 6: Track Feature Usage

```typescript
'use client';

import { trackFeatureUse } from '@/lib/analytics';

export function AdvancedOptions() {
  const handleWatermarkRemoval = () => {
    trackFeatureUse('watermark_removal');
    // Your feature logic
  };

  const handleQualitySelection = (quality: string) => {
    trackFeatureUse(`quality_selection_${quality}`);
    // Your feature logic
  };

  return (
    <div>
      <button onClick={handleWatermarkRemoval}>
        Remove Watermark
      </button>
      <button onClick={() => handleQualitySelection('hd')}>
        Download HD
      </button>
    </div>
  );
}
```

---

## Example 7: Track User Engagement Time

```typescript
'use client';

import { useEffect, useState } from 'react';
import { trackEngagement } from '@/lib/analytics';

export function VideoPlayer({ videoId }: { videoId: string }) {
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Track when video player is mounted
    setStartTime(Date.now());

    return () => {
      // Track engagement time when component unmounts
      if (startTime) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        trackEngagement('video_player', videoId, timeSpent);
      }
    };
  }, [videoId, startTime]);

  return <div>{/* Video player */}</div>;
}
```

---

## Best Practices

### 1. Use in Client Components Only
Always add `'use client'` directive at the top of files using analytics:

```typescript
'use client';

import { trackButtonClick } from '@/lib/analytics';
```

### 2. Don't Over-Track
Track meaningful interactions only:
- ✅ Video downloads
- ✅ Form submissions
- ✅ Important button clicks
- ❌ Every mouse movement
- ❌ Every scroll event

### 3. Add Error Tracking
Always track both success and failure:

```typescript
try {
  await downloadVideo();
  trackVideoDownloadSuccess('tiktok');
} catch (error) {
  trackVideoDownloadError('tiktok', error.message);
}
```

### 4. Keep Event Names Consistent
Use a consistent naming convention:
- Use lowercase with underscores: `video_download_start`
- Be descriptive but concise
- Group related events: `video_download_start`, `video_download_success`, `video_download_error`

### 5. Add Meaningful Parameters
Include context that helps you analyze data:

```typescript
// ✅ Good - includes context
trackVideoDownloadSuccess('tiktok', 'hd');

// ❌ Bad - no context
trackVideoDownloadSuccess();
```

---

## Viewing Custom Events in GA4

1. Go to your GA4 dashboard
2. Navigate to: **Reports** → **Engagement** → **Events**
3. Look for your custom events like:
   - `video_download_start`
   - `video_download_success`
   - `button_click`
   - etc.

Or use **Realtime** → **Event count by Event name** to see events as they happen.

---

## Testing Custom Events

### In Development

1. Start dev server: `pnpm dev`
2. Open browser DevTools → Console
3. Type: `dataLayer` and press Enter
4. Perform an action (click button, paste URL, etc.)
5. Type: `dataLayer` again
6. You should see new events in the array

### Example Console Output

```javascript
dataLayer
// Output:
[
  { event: 'video_download_start', platform: 'tiktok', url_length: 45 },
  { event: 'button_click', button_name: 'download', location: 'main_form' },
  { event: 'video_download_success', platform: 'tiktok', quality: 'hd' }
]
```

---

## 🎯 Recommended Events for ReelSave

Based on your video downloader app, prioritize tracking:

1. **Video Download Flow**
   - `video_download_start`
   - `video_download_success`
   - `video_download_error`

2. **User Input**
   - `url_paste`
   - `platform_select`

3. **Feature Usage**
   - `quality_selection`
   - `watermark_removal`

4. **Navigation**
   - `about_page_view`
   - `privacy_page_view`
   - `terms_page_view`

These events will give you insights into:
- Which platforms are most popular
- Where users drop off in the download process
- Which features are most used
- Error patterns and issues
