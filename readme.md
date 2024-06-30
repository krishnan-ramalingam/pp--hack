# Video Accessibility Chrome Extension

## Overview
Open-source extension enhancing video accessibility across platforms. Compatible with all browsers, devices, and major video players (YouTube, HTML5, Diksha learning portal).

## Key Features

1. **Timestamp Markers**
   - Add custom markers with titles and descriptions
   - Quick navigation to marked sections
   - Import/export timestamp data

2. **Audio Customization**
   - Noise reduction and voice boost
   - Volume and clarity control
   - Toggleable audio processing

3. **Video Enhancement**
   - Adjust brightness, contrast, saturation, exposure
   - Control hue, sharpness, grayscale, and color inversion
   - Toggleable video processing

4. **Annotation Tools**
   - Add text, images, and shapes at specific timestamps
   - Drawing tools (pencil, rectangle, circle, image)
   - Edit, delete, and navigate annotations
   - Import/export annotation data

5. **Focus Mode**
   - Create and record custom focus areas
   - Playback of focus recordings
   - Manage and organize recordings
   - Import/export focus data

6. **Video Description**
   - AI-powered content description (using Moondream2 model)
   - Text-to-speech for auditory feedback
   - Custom description prompts

7. **Settings and Configuration**
   - Export/import all customizations
   - Persistent user preferences

8. **User Interface**
   - Draggable, modular control panel
   - Intuitive controls (sliders, toggles, buttons)
   - Responsive layout

## Technical Highlights
- Export data in small files sizes for personalisation
- JavaScript-based for broad compatibility
- Canvas integration for drawing features
- Web Audio API for advanced audio processing without affecting video
- AI integration for video description
- Local storage for user preferences to export data 

## Future Enhancements
- More AI model integrations to add caption in all languages
- Link the visual describer module with device mic for voice inputs
- Mapping shortcut keys for each section


## API Key

This extension uses the FAL AI API for the Describe feature. The API key is included in the code (`xyz`). Please note that this key may have usage limits or expiration. If you encounter issues, you may need to obtain your own API key from FAL AI.

## Installation

To install this Chrome extension:

1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.
5. The extension should now appear in your Chrome toolbar.

## Usage

Once installed, navigate to any webpage with a video. Click the extension icon in your Chrome toolbar to activate the Video Enhancement Suite. A control panel will appear below the video, allowing you to access all the features.

## Note

This is a complex extension with many features. Some features may not work on all websites due to varying video player implementations. If you encounter any issues, please refresh the page and try again.
