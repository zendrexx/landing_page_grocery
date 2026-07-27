# v4 screenshots — native 2580 × 5592, light + dark

26 screens × 2 themes = 52 captures, straight off a device at **2580 × 5592**
(dpr 6.0). Nothing here is upscaled, composited or retouched — every file is a
frame the shipping release build actually rendered.

| | |
|---|---|
| Master resolution | 2580 × 5592 (14.4 MP), 32-bit colour |
| Logical size | 430 × 932 dp — the App Store 6.9" layout, rendered at 2× its pixels |
| Build | `flutter build apk --release`, `com.zhevion.grocery` |
| Store exports | `store/{light,dark}/` at exactly **1290 × 2796** (App Store 6.9") |

`store/` is a clean 0.5× of the masters, so it downsamples without resampling
artefacts. Keep the masters for portfolio / landing pages / the `../../v3`
compositing kit, and upload the `store/` files.

## The capture device

The `flutter_emulator` AVD was rebuilt as a screenshot rig (previous config
saved alongside it as `config.ini.bak`):

```
hw.lcd.width = 2580      hw.lcd.height = 5592     hw.lcd.density = 960
hw.lcd.depth = 32        hw.ramSize = 4096        hw.gpu.mode = host
```

Density 960 is what keeps the *layout* a normal large phone (430 × 932 dp)
while doubling the pixels behind it. Dropping to a stock 1440 × 3120 / 560 dpi
device halves the resolution; raising the resolution without raising the
density turns the UI into a tablet layout instead.

Depth 32 matters more than it looks — the app is full of forest gradients, and
the AVD's default 16-bit surface bands them visibly.

Status bar is pinned via SystemUI demo mode (09:41, full battery, Wi-Fi only,
no notification icons) and OS animations are off, so every frame is
deterministic:

```
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile hide
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
```

Light/dark pairs are captured **without navigating twice** — the screen is held
still and the system theme is flipped under it (`adb shell cmd uimode night
yes|no`), so `light/x.png` and `dark/x.png` are the same state pixel for pixel.

## The set

| File | Screen |
|---|---|
| `01`–`05_welcome_*` | Welcome carousel (Zeb, pantry-first, budget, scan, ready) |
| `06_signin` | Sign in |
| `10_home` · `11_home_budget` | Home dashboard, top and scrolled |
| `12_budget_plan` | Budget & plan editor |
| `20_plan` | Meal plan — day pills, nutrition hero |
| `21_plan_recipe` | Expanded recipe with Cook this |
| `22_cook_sheet` | "Start cooking?" — pantry covers it |
| `23_cook_shortage` | "Start cooking?" — missing an ingredient, offers the grocery list |
| `30_grocery` | Grocery list, within budget, priced rows |
| `31_price_book` | Community Price Book |
| `40_pantry` | Pantry with expiry warning from Zeb |
| `41_add_to_pantry` | Add manually / scan a receipt / snap your groceries |
| `50_insights` · `51_insights_charts` | Insights KPIs and the spending + nutrition charts |
| `60_profile` · `61_paywall` · `62_profile_appearance` | Profile, plan picker, theme picker |
| `70_zeb_empty` · `71_zeb_chat` | Ask Zeb, empty and mid-conversation |
| `80_generate` · `81_generate_quota` | Generate plan, and the AI quota line |

Not captured: the receipt/photo **scan review** screen, which needs a real
photo in the camera roll and spends a scan of AI quota.

## Regenerating

1. `flutter build apk --release --target-platform android-x64`
2. `adb install -r build/app/outputs/flutter-apk/app-release.apk`
3. Apply the demo-mode block above, then drive the app and capture with
   `adb shell screencap -p /sdcard/_cap.png` + `adb pull`.
   (Do **not** use `adb exec-out screencap -p > file.png` from PowerShell 5.1 —
   its redirection corrupts the binary stream.)
4. `.\export_store.ps1` to refresh `store/`.

`60_profile` and `62_profile_appearance` show the signed-in account's real
email address. Crop or swap the account before publishing those two.
