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

Tap **🎲 Shuffle workout** to pick a random workout: 9 different exercises, never repeated, favoring ones you
didn't just do. Tap **Edit** on a round to change any exercise from a pulldown. Exercises already used in another
round are greyed out. The 🎲 next to each pulldown picks a random unused one. Tap the circle (or **Pause**) to pause.

The exercise list lives in `LIBRARY` at the top of `web/app.js`. Each entry can have:

- `sides: true`: the interval is split in half with a "switch sides" chime, buzz and on-screen cue.
- `weight: 'required'` or `'optional'`: shows a dumbbell icon (faded when optional). Required weights also show
  "Grab your weights" during the get-ready countdown.
- `tip`: a short form cue shown under the timer.

## Installing on your phone

Every push to `main` builds a new APK in GitHub Actions and publishes it as a release.

1. On the phone, open
   **https://github.com/Hearsay-Law/PuppyPlaytime/releases/latest/download/PuppyPlaytime.apk**
2. Open the downloaded file. Android will ask to allow installs from your browser: allow it, then tap **Install**.
3. If Play Protect warns about an unknown app, choose **Install anyway**. It flags any app that isn't from the Play Store.

To update, repeat the same steps. It installs over the old version and keeps your exercises.

Turn up the phone's **media** volume to hear the chimes.

## Project layout

- `web/`: the app itself (HTML/CSS/JS). Open `web/index.html?fast` in a browser to test at 10x speed.
- `android/`: a small WebView wrapper that keeps the screen on and adds vibration.
- `.github/workflows/build-apk.yml`: builds and signs the APK. The signing key is stored in the
  `KEYSTORE_B64` / `KEYSTORE_PASSWORD` repository secrets so every build can update the previous install.

The Fredoka font in `web/fonts/` is licensed under the SIL Open Font License.
