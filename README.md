# Puppy Playtime 🐾

A big-button workout timer for Android, named after Sophie, who thinks we're playing.

## The workout

| Term | Meaning |
|---|---|
| **Workout** | The whole thing: 3 rounds. About 23 minutes plus breaks. |
| **Round** | One trio of exercises (abs · arms/chest · legs/cardio), done as 3 sets. Each round uses a new trio. |
| **Set** | All three exercises once. Each exercise lasts 30s in set 1, 45s in set 2 and 60s in set 3. |
| **Get ready** | A short countdown (3, 5 or 10s) before each exercise so you can get into position. |
| **Break** | Between sets (short) and rounds (longer). The timer waits until you tap **Start**. |

The circle shows the current round as 9 slices: coral = abs, gold = arms/chest, teal = legs/cardio.
Slices are sized by duration and grouped 3 + 3 + 3 by set. The dots at the top show which round you're on.

Tap **Edit** on the home screen to rename any round's exercises. Tap the circle (or **Pause**) to pause.

## Installing on your phone

Every push to `main` builds a new APK in GitHub Actions and publishes it as a release.

1. On the phone, open
   **https://github.com/Hearsay-Law/PuppyPlaytime/releases/latest/download/PuppyPlaytime.apk**
2. Open the downloaded file. Android will ask to allow installs from your browser: allow it, then tap **Install**.
3. If Play Protect warns about an unknown app, choose **Install anyway**. It flags any app that isn't from the Play Store.

To update, repeat the same steps. It installs over the old version and keeps your exercise names.

Turn up the phone's **media** volume to hear the chimes.

## Project layout

- `web/`: the app itself (HTML/CSS/JS). Open `web/index.html?fast` in a browser to test at 10x speed.
- `android/`: a small WebView wrapper that keeps the screen on and adds vibration.
- `.github/workflows/build-apk.yml`: builds and signs the APK. The signing key is stored in the
  `KEYSTORE_B64` / `KEYSTORE_PASSWORD` repository secrets so every build can update the previous install.

The Fredoka font in `web/fonts/` is licensed under the SIL Open Font License.
