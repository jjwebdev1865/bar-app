**Bar App v1 structure**

barapp/

App.tsx

src/

pages/            # Screens: same pattern as Jim Fit

components/

store/             # Zustand — LOCAL/UI state only now (auth state, current screen state)

hooks/

types/

utils/

firebase/          # Firebase config + typed wrappers around Firestore/FCM/Functions calls

functions/           # Firebase Cloud Functions (Node + TS) — separate deployable unit

src/

index.ts         # createInvite, onInviteCreated -> sends FCM push

**Core** **data** **model** **(Firestore)**

- users/{uid} — profile, phone number (hashed for contact-matching lookups), FCM device token

- groups/{groupId} — members, name

- invites/{inviteId} — creator, bar (name/lat/lng), time, group or individual invitees,

responses

**Phased** **build** **order**

1. **Firebase** **project** **+** **auth** — phone or email auth, get a signed-in user on the device

2. **Contacts** **sync** — expo-contacts permission flow, hash local numbers, query Firestore for

matches (this is the trickiest privacy-sensitive piece — worth care)

3. **Groups** — create/view a group of matched friends

4. **Invite** **creation** — pick a bar (manual entry + GPS-sorted "near me" list), pick invitees,

write to Firestore

5. **Push** **notifications** — Cloud Function triggers on invite creation, sends FCM push to invitees'

stored tokens

6. **Notification** **handling** **on** **device** — foreground/background receipt, deep link into the invite

screen, respond (going/not going)

7. **Realtime** **invite** **status** — Firestore listener showing who's responded, live