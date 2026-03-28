# NEEO `gui_xml` Documentation

The `gui_xml` file (and its companion `guidata_xml`) defines the entire native user interface of the NEEO Remote. The physical remote control (running the TR2 client) does not use HTML/CSS or a Web View; instead, it parses this XML file using a highly optimized native C++ graphics engine to render the interface and handle interactions.

This document breaks down the core components, layout structures, and action bindings available in `gui_xml`.

## Root Structure

The XML is wrapped in a `<doc>` root node. The file generally follows this structure:

```xml
<doc>
    <keypadMapping>...</keypadMapping>
    <header>...</header>
    <guiConfig ... />
    <appConfig ... />
    <font-styles>...</font-styles>
    <popupStyle id="...">...</popupStyle>
    <screen id="...">...</screen>
</doc>
```

### 1. Global Configurations

*   **`<keypadMapping>`**: Defines the base hardware codes for the physical buttons (e.g., `MUTE`, `HOME`, `POWER`, `VOLUP`, `VOLDOWN`, `BACK`, `CHUP`, `CHDOWN`, D-Pad, `OK`, `MENU`). You can specify properties like `longPressDelay="2000"` and `repeat="80"`.
*   **`<guiConfig>`**: Controls global physics and UI constants, such as `listDampingFactor`, `volumePopupTimeout`, `dotColor` (for pagination dots), and `startScreenId`.
*   **`<font-styles>`**: Maps font names (e.g., `normal`, `small`, `symbol`) to TTF files and sizes. The `symbol` fonts map specific Unicode characters (`#e034`) to NEEO's icon set.
*   **`<header>` (Global)**: Defines the top status bar (battery, Wi-Fi, 6LoWPAN) which is drawn over the screens.

---

## Screen Definitions

The core building blocks of the UI are `<screen>` tags. 
Screens can be nested, and they act as containers for layout elements.

### Screen Types

*   **`type="Custom"`**: Free-form absolute positioning. Elements within this screen must have explicit `x` and `y` coordinates.
*   **`type="Grid"`**: Automatically aligns child elements into rows and columns. It requires `<row>` child nodes.
*   **`type="Clone"`**: Mirrors the contents of another screen (referenced via the `source` attribute). Useful for keeping background layers consistent.
*   **`type="HLine"`**: Sometimes used inside `graphicElement` for horizontal dividers.

### Screen Attributes

*   `id`: Unique identifier (often a 64-bit integer string like `"6232364704744865792"` or a string like `"settings"`).
*   `collection`: Pagination grouping (e.g., `"1/6"` means page 1 of 6). Automatically renders the pagination dots at the bottom.
*   `onSlideToLeft` / `onSlideToRight`: Binds swipe gestures to actions (typically `ChangeScreen()`).
*   `onLoad` / `onUnload`: Fires actions when the screen becomes visible or hidden.
*   `backgroundColor` / `frameColor`: Color definitions (ARGB format, e.g., `#FF000000`).

---

## UI Components

Inside a `<screen>` (or `<popupStyle>`), you can place various UI components:

### 1. `<button>`
The most common interactive element. 
*   **Layout**: `x`, `y`, `width`, `height`
*   **Styling**: `frameColor`, `backgroundColor`, `activeBackgroundColor`
*   **Text**: `text`, `secondText`, `font`, `textColor`, `activeTextColor`
*   **Icons**: `icoFont` (e.g., `"symbol"`), `icoChar` (e.g., `"#e028"`), `icoColor`, `activeIcoColor`
*   **Images**: `image` (URL path from Brain imagecache), `placeholderText`
*   **Events**: `onClick`, `onPress`, `onLongPress`, `onRelease`

### 2. `<textView>`
Displays static or data-bound text.
*   `text="Welcome Home"` (Static)
*   `text="[[tr2.battery_percentage]]"` (Dynamic binding to remote state)
*   Attributes: `alignment="Center"`, `font="largelight"`

### 3. `<image>`
Displays a static image (often used in the header for battery/wifi).
*   `contentId="wifiIcon.png"`
*   `hidden="[[tr2.wifi_icon_hidden]]"` (Dynamic visibility)
*   `activeFrame="[[tr2.wifi_rssi_state]]"` (Spritesheet frame selection)

### 4. Special Components
*   **`<loader>` / `<progressBar>`**: Used on the "RUNNING RECIPE" screens.
*   **`<guiClock>`**: Used in the About screen (`clockType="uptime"`).
*   **`<graphicElement type="HLine">`**: Draws a horizontal line.

---

## Hardware Key Overrides

Inside any `<screen>`, you can override what the physical hardware buttons do using the `<key>` tag:

```xml
<key id="POWER" onLongPress="ShowPopup('PowerOffConfirm')" />
<key id="MUTE" onPress="TriggerAction('5n')" />
<key id="HOME" onPress="ChangeScreen('0', -1)" />
```
If a screen is active, these local `<key>` definitions override the default behavior.

---

## Actions & Callbacks

When a button is pressed or a screen is swiped, the Remote executes commands defined in the event attributes (`onClick`, `onSlideToRight`, etc.).

### 1. `TriggerAction('<shorturl_id>')`
This is the **most important action for Custom Brains**. 
When the Remote evaluates `TriggerAction('5n')`, it immediately sends an HTTP request to the Brain:
```http
GET /shorturl/5n HTTP/1.1
```
*By intercepting these `/shorturl/...` requests on the custom Brain, you can trigger scripts, Home Assistant automations, Sonos commands, etc., completely replacing the original Brain's device execution logic.*

### 2. `ChangeScreen('<screen_id>', <direction>)`
Navigates to another screen.
*   `direction`: `1` for forward (slide left), `-1` for back (slide right).
*   *Example:* `ChangeScreen('settings', 1)`

### 3. `ActivateScenario('<screen_id>', '<shorturl_id>', '<name>', '<state>')`
Used for Recipe tracking. It executes the shorturl (e.g., starting a recipe) and switches to the loading screen, eventually navigating to the target `screen_id`.
*   *Example:* `ActivateScenario('1234', '5e', 'APPLE TV', 'start')`

### 4. Popups
*   **`ShowPopup('<popup_id>')`**: Opens a modal layer over the UI. The modal must be defined in the root as a `<popupStyle id="...">`.
*   **`HidePopup()`**: Closes the currently active popup.

---

## Modifying the UI (Custom Brain)

Because the UI is generated strictly from the XML, a Custom Brain (Emulator) can rewrite the interface dynamically.

**How to build your own screens:**
1. Intercept `GET /projects/home/tr2/gui_xml` on your Custom Brain.
2. Return your own customized XML structure instead of proxying the original Brain.
3. Map custom hardware keys and touch buttons to arbitrary `TriggerAction('my_custom_id')` codes.
4. Catch `GET /shorturl/my_custom_id` in your server to execute your own code.

This effectively turns the NEEO Remote into an open, fully native, and highly responsive programmable touch display.
