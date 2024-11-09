<div align="center">
 <img src="./Desktop/src-tauri/icons/appicon.png" width=30%>
 <h1>CaLens</h1>

:x: No more manual event or deadline entries!

Simply take a screenshot with CeLens, and it will automatically add the event to your calendar :rocket:

Powered by :eyes: Vision Language Models

</div>

![CeLens Screenshot](./screenshot.png)
_\*Screenshot is taken in Pacific Time_

## :paperclip: Contents

- [:paperclip: Contents](#paperclip-contents)
- [:rocket: Features](#rocket-features)
  - [:dart: Planned](#dart-planned)
- [:computer: Supported OS](#computer-supported-os)
- [:cake: Usage](#cake-usage)
- [:hammer: Build](#hammer-build)
- [:art: Contribution](#art-contribution)
  - [Language, Frameworks \& Tools](#language-frameworks--tools)
  - [Repo structure](#repo-structure)

## :rocket: Features

- :crystal_ball: Intelligent extraction & summary by Vision LLM
- :scissors: Take screenshot anywhere global shortcut
- :link: Show links to mainstream calendars

### :dart: Planned

- :zap: Add multiple events in one time
- $\int$ Google calendar API integration
- :floppy_disk: Download ICS
- :cloud: Officially hosted server

## :computer: Supported OS

- [x] MacOS
- [ ] Windows: :eyes: coming soon
- [ ] Web: :eyes: coming soon
- [ ] Linux: :penguin: contribution welcomed
- [ ] Mobile: :full_moon_with_face: possible future

## :cake: Usage

The app is currently in early development. You will need to provide your own OpenAI API key, which will be stored locally in the app's config directory.

After that, just press the shortcut to take screenshots!

## :hammer: Build

To build CeLens from source, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Cy-47/CaLens.git
   ```
2. Navigate to the project directory:
   ```sh
   cd CeLens/Desktop
   ```
3. Install the dependencies:
   ```sh
   pnpm install
   ```
4. Build and run the application:

   Use one of the following commands:

   ```sh
   # For development
   pnpm tauri dev
   # For production build
   pnpm tauri build
   ```

## :art: Contribution

Welcome!

### Language, Frameworks & Tools

- TypeScript
- Tauri
- SvelteKit & Vite
- TailwindCSS
- OpenAI API
- Flowbite Svelte

### Repo structure

- `Core`
  - Event parsing, inference
- `Desktop`
  - Desktop App
