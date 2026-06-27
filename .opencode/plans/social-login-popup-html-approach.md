# Social Login Popup — Backend-HTML Approach

## Problem
Chrome blocks `window.close()` in popups after cross-origin navigation through Google/Facebook. The current approach (backend redirects to a frontend callback page that tries `window.close()`) doesn't work reliably.

## Solution
Backend returns HTML directly from the OAuth callback endpoint. The HTML posts auth data to the opener via `window.opener.postMessage()` and navigates away to `about:blank`. The opener closes the popup via its `window.open()` reference (always allowed per HTML spec).

## Files to Change

### 1. `apps/api/src/core/auth/auth.controller.ts`
**Goal:** Replace `res.redirect()` with `res.send(html)` in both `googleAuthRedirect` and `facebookAuthRedirect`.

**Changes:**
- Import `UserProfile` from `@lms/shared-types`
- Add two private methods:
  - `buildSuccessHtml(result, origin)` — returns HTML that `postMessage`s success + closes
  - `buildErrorHtml(errorMessage)` — returns HTML that `postMessage`s error + closes
- Replace the body of `googleAuthRedirect`:
  ```ts
  const result = await this.socialAuthService.validateOrCreateUser(
    AuthProvider.GOOGLE, req.user, role,
  );
  const origin = this.configService.get<string>('app.frontendUrl');
  return res.type('text/html').send(this.buildSuccessHtml(result, origin));
  ```
- Same change for `facebookAuthRedirect`
- Error case (invalid state): `return res.type('text/html').send(this.buildErrorHtml('Invalid or expired OAuth state'))`

**`buildSuccessHtml` implementation:**
```ts
private buildSuccessHtml(
  result: { user: any; accessToken: string; refreshToken: string },
  origin: string,
): string {
  const payload = JSON.stringify({
    type: 'OAUTH_SUCCESS',
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  const escapedOrigin = origin.replace(/'/g, "\\'");
  return `<!DOCTYPE html>
<html><body><script>
try{window.opener.postMessage(${payload},'${escapedOrigin}')}catch(e){}
try{window.close()}catch(e){}
window.location.replace('about:blank');
</script></body></html>`;
}
```

**`buildErrorHtml` implementation:**
```ts
private buildErrorHtml(message: string): string {
  const payload = JSON.stringify({ type: 'OAUTH_ERROR', message });
  return `<!DOCTYPE html>
<html><body><script>
try{window.opener.postMessage(${payload},'${escapedOrigin}')}catch(e){}
try{window.close()}catch(e){}
window.location.replace('about:blank');
</script></body></html>`;
}
```

### 2. `apps/web/src/app/(auth)/auth/callback/page.tsx`
**Goal:** No longer needed — remove or replace with a simple redirect.

**Option A (cleaner):** Delete the file and its route.
**Option B (safer):** Replace with a component that shows "Authentication complete, you may close this window" and tries to close.

**Recommendation:** Option A — the backend no longer redirects here.

### 3. `apps/web/src/components/auth/SocialLoginWithPopup.tsx`
**Goal:** Update to handle cross-origin `postMessage` from the API domain. Remove `localStorage` fallback.

**Changes:**
- In `handleOAuthMessage`, add `event.origin` check:
  ```ts
  if (event.origin !== API_URL) return;
  ```
- Remove `handleStorageEvent` and its `useEffect` registration (no longer needed)
- Remove `localStorage.removeItem('oauth_result')` from `handleStorageEvent`
- Keep `popupRef`, `closePopup()`, and retry interval unchanged
- Simplify `notifyOpener` (not needed in the opener, only in the callback page which is removed)

### 4. (Optional) `apps/web/src/app/(auth)/register/RegisterForm.tsx` and `LoginForm.tsx`
**Goal:** No changes needed — they already use `SocialLoginWithPopup`.

## Architecture After Change

```
Opener tab (frontend.com)               Popup window
       │                                     │
       │  window.open() ──────────────────►  │ (opens popup)
       │                                     │
       │                                     ├─► GET /auth/google?role=learner
       │                                     │   (backend redirects to Google)
       │                                     │
       │                                     ├─► Google consent screen
       │                                     │
       │                                     ├─► GET /auth/google/callback?code=...&state=...
       │                                     │   (NestJS: AuthGuard validates)
       │                                     │
       │                                     │  Backend returns HTML:
       │                                     │  postMessage({type:'OAUTH_SUCCESS',...}) ──►
       │  ◄── message event fires            │
       │  onAuthSuccess:                     │
       │    - setAuth(user, access, refresh) │
       │    - redirectByRole()               │
       │    - closePopup() ──────────────────►  win.close() (opener closes popup ✓)
       │                                     │
       │  GUI: new page shown                 popup: closes (or shows about:blank)
```

## Key Points
- `postMessage` now goes **cross-origin** (API → frontend) — requires explicit `event.origin` check on frontend
- `window.close()` still blocked in popup — but `popupRef.current.close()` from opener works
- `about:blank` fallback prevents dashboard display in popup
- No frontend callback page needed — simpler architecture
- No extra `/profile/me` call — user data comes directly from `validateOrCreateUser` response
