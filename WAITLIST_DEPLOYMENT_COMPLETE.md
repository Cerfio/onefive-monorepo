# ✅ Waitlist System - Deployment Complete

## Status: READY FOR TESTING

All implementation steps completed successfully! The waitlist/clubhouse effect system is now fully deployed.

## What Was Done

### 1. Database Migration ✅
- Created initial migration with all schema changes
- Applied migration successfully
- Seeded 2 badge records (EARLY_ADOPTER, FOUNDING_MEMBER)

### 2. Backend Compilation ✅
- Fixed seed.ts referral references (invitedUserId → invitedProfileId)
- Removed counter fields (totalSent, totalAccepted, totalPending, rank)
- Removed acceptReferral calls from OAuth handlers (Google, LinkedIn)
- Full TypeScript compilation successful

### 3. Frontend Build ✅
- No TypeScript errors
- Waitlist page built successfully at `/waitlist`
- Production build completed

## Architecture Summary

### Three User Flows

**Flow A: Normal Signup (No Referral)**
- User signs up → creates profile
- `waitlistStatus = WAITING` (default)
- Redirected to `/waitlist` page
- Can share referral link to unlock

**Flow B: Ambassador Referral**
- User signs up with `?ref={ambassadorCode}`
- Creates Referral with `referrerType = AMBASSADOR`, `status = ACCEPTED`
- `waitlistStatus = ACTIVE` immediately
- NO badge awarded
- Can access platform directly

**Flow C: User Referral → Founding Member**
- User signs up with `?ref={userCode}`
- Creates Referral with `referrerType = USER`, `status = PENDING`
- `waitlistStatus = WAITING`
- When referral completes onboarding → `status = ACCEPTED`
- When referrer hits 10 accepted referrals:
  - `waitlistStatus → ACTIVE`
  - FOUNDING_MEMBER badge awarded
  - Email sent with congratulations
  - Can now access platform

### Guard Priority (Self-Profile Handler)
1. **EmailGuard**: Checks `isEmailVerified` → throws ProfileEmailNotVerifiedException
2. **OnboardingGuard**: Checks `hasCompletedOnboarding` → throws ProfileOnboardingNotCompletedException  
3. **WaitlistGuard**: Checks `waitlistStatus === WAITING` → throws WaitlistPendingException

Frontend WithAuth component catches these exceptions and redirects accordingly.

## Database Schema Additions

### Profile Model
```prisma
waitlistStatus     WaitlistStatus @default(WAITING)
activatedAt        DateTime?
referralCode       String @unique @default(uuid())
referredByCode     String?
referrerType       ReferrerType?
badges             UserBadge[]
referralReceived   Referral?
ambassador         Ambassador?
```

### New Models
- **Badge**: type (EARLY_ADOPTER, FOUNDING_MEMBER), name, description
- **UserBadge**: Junction table for Profile ↔ Badge (profileId, badgeId, awardedAt)
- **Ambassador**: profileId, name, title, bio, interviewUrl, avatarUrl, isActive

### Referral Changes
- Changed: `invitedUserId` → `invitedProfileId` (now points to Profile)
- Added: `referrerType` ReferrerType? (AMBASSADOR or USER)
- Moved: `referralReceived` relation from User to Profile

### ReferralStats Changes  
- **REMOVED**: totalSent, totalAccepted, totalPending, rank (all counters)
- **KEPT**: currentTier String (Starter/Bronze/Silver/Gold/Platinum/Diamond)
- All stats computed dynamically via DB queries

## API Endpoints

### Waitlist
- `GET /waitlist/status` - Returns position, referral counts, badge info
- `GET /waitlist/leaderboard?limit=20` - Returns top referrers with counts

### Referrals (Updated)
- `GET /referral/stats` - Dynamic computation of referral tiers
- `GET /referral/leaderboard` - Raw SQL with COUNT() aggregation
- `GET /referral/my-referrals` - Uses invitedProfile relation

## Frontend Pages

### /waitlist
- Dynamic position display (#123 in waitlist)
- Referral stats (X accepted, Y pending)
- Founding Member progress bar (7/10 = 70%)
- Referral link with copy + share (LinkedIn, Twitter, WhatsApp)
- Top 5 leaderboard with rank badges
- Badge display if awarded
- Auto-refreshes every 30s (status) and 60s (leaderboard)

### Signup Flow
- Reads `?ref=` query param
- Stores in `referredByCode` cookie (30-day expiry)
- Passed to backend on profile creation
- Cookie deleted after successful creation

## Next Steps

### Testing Checklist

#### 1. Test Flow A (Normal Signup)
```bash
# Open browser in incognito
1. Navigate to https://app.onefive.com/signup
2. Create new account
3. Complete onboarding
4. Should land on /waitlist
5. Verify position shows (#1 or higher)
6. Copy referral link
7. Verify format: https://app.onefive.com/signup?ref={uuid}
8. Check progress bar shows 0/10
```

#### 2. Test Flow C (User Referral)
```bash
# Using referral link from step 1
1. Open new incognito window
2. Paste referral link from Flow A
3. Sign up + complete onboarding
4. Should land on /waitlist (not activated yet)
5. In original user's session, refresh /waitlist
6. Should see accepted count increase to 1

# Repeat for 10 total referrals
7. After 10th referral completes onboarding:
   - Original user should be auto-activated
   - Should receive "Founding Member" badge
   - Should receive email notification
   - Next visit to /feed should work (no waitlist)
```

#### 3. Test Flow B (Ambassador Referral)
```bash
# First create an Ambassador record
1. Connect to database:
   psql postgresql://yanniscoulibaly@localhost:5432/onefive

2. Find a test profile ID:
   SELECT id, "firstName", "lastName" FROM "Profile" LIMIT 1;

3. Create ambassador:
   INSERT INTO "Ambassador" (id, "profileId", name, title, "isActive", "createdAt")
   VALUES (gen_random_uuid(), '<profile-id>', 'Test Ambassador', 'Co-founder', true, NOW());

4. Get ambassador's referral code:
   SELECT "referralCode" FROM "Profile" WHERE id = '<profile-id>';

5. Open incognito, visit:
   https://app.onefive.com/signup?ref=<ambassador-referral-code>

6. Complete signup + onboarding
7. Should be redirected to /feed (NOT /waitlist)
8. Should NOT have any badge
9. Check Referral record:
   SELECT * FROM "Referral" WHERE "referrerId" = '<profile-id>' ORDER BY "createdAt" DESC LIMIT 1;
   - Should have referrerType = 'AMBASSADOR'
   - Should have status = 'ACCEPTED'
```

#### 4. Test Email Notifications
```bash
# In onefive-email project
1. Navigate to email templates:
   cd /Users/yanniscoulibaly/oneFive/onefive-email

2. Start dev server:
   npm run dev

3. Open http://localhost:3000
4. Preview templates:
   - /transactional/account-activated
   - /transactional/founding-member

5. Verify rendering, copy, CTAs work correctly
```

#### 5. Test Leaderboard
```bash
1. Visit /waitlist
2. Scroll to leaderboard section
3. Should show top 5 referrers
4. Verify count accuracy against database:
   SELECT p."firstName", p."lastName", COUNT(r.id)::int as count
   FROM "Profile" p
   LEFT JOIN "Referral" r ON r."referrerId" = p.id AND r.status = 'ACCEPTED'
   GROUP BY p.id
   ORDER BY COUNT(r.id) DESC
   LIMIT 5;
```

### Database Queries

#### Check Waitlist Status
```sql
SELECT 
  "firstName",
  "lastName",
  "waitlistStatus",
  "activatedAt",
  "referralCode",
  "referredByCode",
  "referrerType"
FROM "Profile"
ORDER BY "createdAt" DESC
LIMIT 10;
```

#### Check Referral Counts
```sql
SELECT 
  p."firstName",
  p."lastName",
  COUNT(CASE WHEN r.status = 'ACCEPTED' THEN 1 END) as accepted,
  COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END) as pending
FROM "Profile" p
LEFT JOIN "Referral" r ON r."referrerId" = p.id
GROUP BY p.id
HAVING COUNT(r.id) > 0
ORDER BY accepted DESC;
```

#### Check Badges Awarded
```sql
SELECT 
  p."firstName",
  p."lastName",
  b.type as badge_type,
  ub."awardedAt"
FROM "UserBadge" ub
JOIN "Profile" p ON ub."profileId" = p.id
JOIN "Badge" b ON ub."badgeId" = b.id
ORDER BY ub."awardedAt" DESC;
```

#### Manually Activate a Profile (Testing Only)
```sql
UPDATE "Profile" 
SET 
  "waitlistStatus" = 'ACTIVE',
  "activatedAt" = NOW()
WHERE id = '<profile-id>';
```

#### Backfill Existing Users (Run Once)
```sql
-- If you have existing users that should be auto-activated
UPDATE "Profile" 
SET 
  "waitlistStatus" = 'ACTIVE',
  "activatedAt" = NOW()
WHERE "createdAt" < '2026-02-08'; -- Before waitlist launch
```

## Troubleshooting

### Issue: User stuck on waitlist despite 10 referrals
**Check:**
```sql
SELECT 
  p.id,
  p."firstName",
  p."waitlistStatus",
  COUNT(CASE WHEN r.status = 'ACCEPTED' AND r."referrerType" = 'USER' THEN 1 END) as user_referrals
FROM "Profile" p
LEFT JOIN "Referral" r ON r."referrerId" = p.id
WHERE p.id = '<profile-id>'
GROUP BY p.id;
```

**Solution:** If count is 10+ but status is WAITING:
```sql
UPDATE "Profile" SET "waitlistStatus" = 'ACTIVE', "activatedAt" = NOW() WHERE id = '<profile-id>';

-- Award badge manually
INSERT INTO "UserBadge" ("profileId", "badgeId", "awardedAt")
SELECT '<profile-id>', id, NOW()
FROM "Badge"
WHERE type = 'FOUNDING_MEMBER';
```

### Issue: Referral not counting
**Check referral status:**
```sql
SELECT * FROM "Referral" 
WHERE "referrerId" = '<referrer-profile-id>' 
ORDER BY "createdAt" DESC;
```

**Common causes:**
- Invited user didn't complete onboarding (check `hasCompletedOnboarding`)
- Referral type is AMBASSADOR (these don't count toward Founding Member)
- Referral status still PENDING (invited user needs to finish onboarding)

### Issue: Ambassador referral not activating immediately
**Check:**
```sql
SELECT 
  p.id,
  p."firstName",
  p."waitlistStatus",
  a.id as ambassador_id
FROM "Profile" p
LEFT JOIN "Ambassador" a ON a."profileId" = p.id
WHERE p."referralCode" = '<code>';
```

**Solution:** Referrer must have Ambassador record with `isActive = true`

### Issue: Frontend shows error on /waitlist
**Check browser console** for API errors

**Verify backend is running:**
```bash
cd /Users/yanniscoulibaly/oneFive/onefive-back
npm run start:dev
```

**Test API directly:**
```bash
# Get your session token from browser cookies
curl -H "Cookie: token=<your-token>" http://localhost:3001/waitlist/status
```

## Monitoring

### Key Metrics to Track

1. **Waitlist Growth**
```sql
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as signups,
  COUNT(CASE WHEN "waitlistStatus" = 'ACTIVE' THEN 1 END) as activated
FROM "Profile"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;
```

2. **Referral Performance**
```sql
SELECT 
  DATE(r."createdAt") as date,
  r."referrerType",
  COUNT(*) as referrals,
  COUNT(CASE WHEN r.status = 'ACCEPTED' THEN 1 END) as accepted
FROM "Referral" r
WHERE r."createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE(r."createdAt"), r."referrerType"
ORDER BY date DESC, "referrerType";
```

3. **Founding Member Progress**
```sql
SELECT 
  CASE 
    WHEN accepted_count >= 10 THEN '10+'
    WHEN accepted_count >= 5 THEN '5-9'
    WHEN accepted_count >= 1 THEN '1-4'
    ELSE '0'
  END as referral_bucket,
  COUNT(*) as profiles
FROM (
  SELECT 
    p.id,
    COUNT(CASE WHEN r.status = 'ACCEPTED' THEN 1 END) as accepted_count
  FROM "Profile" p
  LEFT JOIN "Referral" r ON r."referrerId" = p.id
  WHERE p."createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY p.id
) stats
GROUP BY referral_bucket
ORDER BY referral_bucket;
```

## Files Modified/Created

### Backend (onefive-back)
**Created:**
- `prisma/schema/badge.prisma`
- `prisma/schema/ambassador.prisma`
- `src/waitlist/waitlist.service.ts`
- `src/waitlist/waitlist.controller.ts`
- `src/waitlist/waitlist.module.ts`
- `src/waitlist/handlers/get-waitlist-status.handler.ts`
- `src/waitlist/handlers/get-waitlist-leaderboard.handler.ts`

**Modified:**
- `prisma/schema/profile.prisma` - Added waitlist fields
- `prisma/schema/referral.prisma` - Changed to Profile-based
- `prisma/schema/user.prisma` - Removed referral relation
- `src/profile/profile.exception.ts` - Added WaitlistPendingException
- `src/profile/handlers/self-profile.handler.ts` - Added waitlist check
- `src/profile/handlers/create-profile.handler.ts` - Calls waitlist processing
- `src/profile/dto/create-profile.dto.ts` - Added referredByCode
- `src/referral/referral.service.ts` - Removed counters, dynamic queries
- `src/referral/handlers/get-stats.handler.ts` - Dynamic computation
- `src/auth/handlers/signup.handler.ts` - Removed acceptReferral
- `src/auth/handlers/auth-google.handler.ts` - Removed acceptReferral
- `src/auth/handlers/auth-linkedin.handler.ts` - Removed acceptReferral
- `prisma/seed.ts` - Fixed for new schema

### Frontend (onefive-front)
**Created:**
- `src/app/(waitlist)/layout.tsx`
- `src/app/(waitlist)/waitlist/page.tsx`
- `src/queries/waitlist.ts`

**Modified:**
- `src/providers/withAuth.tsx` - Catches WaitlistPendingException
- `src/features/auth/Signup/index.tsx` - Stores ?ref= in cookie
- `src/queries/profile.ts` - Reads referredByCode cookie

### Email Service (onefive-email)
**Created:**
- `transactional/emails/account-activated.tsx`
- `transactional/emails/founding-member.tsx`

## Success Criteria

✅ All files created/modified  
✅ Database migration applied  
✅ Badges seeded  
✅ Backend compiles without errors  
✅ Frontend builds without errors  
⬜ Flow A tested (normal signup)  
⬜ Flow B tested (ambassador referral)  
⬜ Flow C tested (user referral → founding member)  
⬜ Email templates previewed  
⬜ Leaderboard verified  

---

**Last Updated:** February 8, 2026  
**Status:** Ready for Testing  
**Next Action:** Run test checklist above
