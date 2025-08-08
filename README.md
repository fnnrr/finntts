
# Text-to-Speech Synthesizer

A modern, browser-based text-to-speech application that converts text into natural-sounding audio with customizable voice settings.

**[➡️ Live Demo](https://finntts.netlify.app/)**

![Application Screenshot](https://user-images.githubusercontent.com/12345/67890-abcdef-1234-5678-90ab-cdef12345678.png)
*(Note: Replace the placeholder URL above with a direct link to your screenshot after you upload it to GitHub.)*

---

## About The Project

This web application provides an intuitive interface to the browser's built-in Web Speech API, allowing users to convert written text into high-quality speech. It's built with modern web technologies like React, Vite, and Tailwind CSS, offering a fast, responsive, and sleek user experience.

Key features include real-time playback with pause/resume functionality, a visual progress bar, and the ability to download the synthesized speech as an MP3 file.

## Features

- **Real-Time Synthesis**: Instantly converts text to speech using the browser's native engine.
- **Customizable Voice**: Choose from a wide range of system voices available in your browser.
- **Adjustable Controls**: Fine-tune the speech **rate**, **pitch**, and **volume**.
- **Playback Control**: **Speak**, **Pause**, **Resume**, and **Stop** the audio playback.
- **Visual Feedback**: A YouTube-style progress bar and `MM:SS` timer show playback progress.
- **MP3 Download**: Save the generated speech as an MP3 audio file for offline use.
- **Modern UI**: A sleek, dark-themed, and responsive interface that looks great on all devices.
- **Long Text Support**: Automatically splits long text into manageable chunks for downloads.

## Technologies Used

- **[React](https://react.dev/)**: A JavaScript library for building user interfaces.
- **[Vite](https://vitejs.dev/)**: A next-generation frontend tooling for fast development.
- **[TypeScript](https://www.typescriptlang.org/)**: A statically typed superset of JavaScript.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and npm installed on your machine.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd your-repo-name
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Building for Production

To create an optimized production build, run:
```sh
npm run build
```
The bundled files will be located in the `dist/` directory, ready for deployment.

---

## How to Use the App

1.  **Enter Text**: Type or paste the text you want to convert into the main text area.
2.  **Select a Voice**: Choose your preferred voice from the dropdown menu. The available voices depend on your browser and operating system.
3.  **Adjust Settings**: Use the sliders to change the **Rate**, **Pitch**, and **Volume** of the speech.
4.  **Control Playback**:
    - Click **Speak** to start the playback. The button will change to **Pause**.
    - Click **Pause** to halt the speech. The button will change to **Resume**.
    - Click **Stop** to end the playback completely.
5.  **Download Audio**: Click the **Download** button to save the audio as an MP3 file.

### Known Limitations

- The **Download** functionality uses a separate, unofficial Google Translate service. As a result, the voice in the downloaded MP3 file may differ from the voice selected for the live preview.
