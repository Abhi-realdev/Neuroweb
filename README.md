# NeuraWeb — Emotion-Sensing AI Website

A futuristic, production-ready web application that reads users' facial emotions in real-time via webcam and dynamically adapts the entire UI experience including background themes, color palettes, ambient music, and voice narration.

![NeuraWeb Banner](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=400&fit=crop)

## 🎯 Features

### Real-time Emotion Detection
- **AI-Powered Face Analysis**: Uses face-api.js with TensorFlow.js for real-time emotion detection
- **7 Emotions Detected**: Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral
- **Confidence Scores**: Live confidence percentages for detected emotions
- **Face Bounding Box**: Visual overlay showing detected face regions

### Dynamic Theme Engine
- **Emotion-Based Color Palettes**: Each emotion triggers unique gradients and color schemes
  - 🟡 Happy → Yellow/Orange
  - 🔵 Sad → Blue
  - 🔴 Angry → Red
  - 🟣 Fearful → Purple
  - 🟢 Disgusted → Green
  - 🟠 Surprised → Peach
  - ⚪ Neutral → Soft Grey/White
- **Smooth Transitions**: 600-900ms animated transitions between themes
- **Glassmorphism UI**: Modern glass-like effects with backdrop blur
- **Neon Glow Effects**: Dynamic glowing borders and shadows

### Audio Experience
- **Web Audio API Ambient Music**: Real-time tone generation with emotion-specific frequencies
  - Happy: 440 Hz
  - Sad: 220 Hz
  - Angry: 120 Hz
  - Fearful: 320 Hz
  - Disgusted: 160 Hz
  - Surprised: 520 Hz
  - Neutral: 280 Hz
- **Voice Narration**: Browser speechSynthesis with contextual emotion responses
- **Toggle Controls**: Easy on/off switches for music and narration

### Live Dashboard
- **Real-time Stats**: Current emotion and confidence display
- **Emotion Logs**: Track last 10 emotion changes with timestamps
- **Sensitivity Slider**: Adjustable detection threshold (1-100%)
- **Emotions Legend**: Visual guide for all detectable emotions

### Snapshot Feature
- **Capture & Download**: Save webcam images with emotion overlay
- **PNG Export**: High-quality image downloads with emotion labels

### Additional Features
- **Animated Background Particles**: Dynamic floating elements reacting to emotions
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Beautiful loading animations while AI models initialize
- **Error Handling**: Graceful camera permission handling
- **Offline Capable**: Works on localhost without internet (after initial model download)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser with webcam
- Camera permissions enabled

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd neuraweb
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Run the development server**
```bash
npm run dev
# or
bun dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

5. **Allow camera access**
When prompted, grant camera permissions to enable emotion detection

## 🎮 How to Use

1. **Start Camera**: Click the "Start Camera" button to enable your webcam
2. **Wait for Detection**: The AI will automatically detect your face and emotions
3. **Watch the Magic**: The entire UI will dynamically adapt to your emotional state
4. **Adjust Sensitivity**: Use the slider to fine-tune detection threshold
5. **Enable Audio**: Toggle music and narration for a fully immersive experience
6. **Take Snapshots**: Capture moments with the snapshot button

## 📁 Project Structure

```
neuraweb/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx             # Homepage showcasing NeuraWeb
│   │   └── globals.css          # Global styles and Tailwind config
│   ├── components/
│   │   ├── NeuraWeb.tsx         # Main emotion-sensing component
│   │   └── ui/                  # Shadcn/UI components
│   └── lib/
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **AI/ML**: face-api.js (TensorFlow.js)
- **Audio**: Web Audio API
- **Speech**: Browser SpeechSynthesis API
- **Package Manager**: Bun / npm

## 📦 Key Dependencies

```json
{
  "face-api.js": "^0.22.2",
  "next": "^15.x",
  "react": "^19.x",
  "tailwindcss": "^4.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x"
}
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration
   - Click "Deploy"

3. **Configure Settings** (Optional)
   - Set environment variables if needed
   - Configure custom domain
   - Enable analytics

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Deploy to Netlify

1. **Build Configuration**
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. **Deploy on Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

3. **Enable Camera Permissions**
   - Ensure your site uses HTTPS (automatic on Netlify)
   - Camera API requires secure context

**One-Click Deploy:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=<your-repo-url>)

## 🔒 Browser Permissions

NeuraWeb requires camera access to function. The application handles permissions gracefully:

- **First Visit**: Browser will prompt for camera permission
- **Permission Denied**: Clear error message with instructions
- **Secure Context Required**: Must be served over HTTPS in production

## 🎨 Customization

### Modify Emotion Themes

Edit `src/components/NeuraWeb.tsx`:

```typescript
const EMOTION_CONFIG = {
  happy: {
    gradient: "linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%)",
    color: "#YOUR_ACCENT_COLOR",
    frequency: 440, // Hz for ambient sound
    narration: "Your custom narration text",
  },
  // ... other emotions
};
```

### Adjust Detection Sensitivity

Default sensitivity is 50%. Users can adjust via slider, or set programmatically:

```typescript
const [sensitivity, setSensitivity] = useState([75]); // 75% threshold
```

### Customize Audio Frequencies

Modify the frequency values in `EMOTION_CONFIG` to change the ambient tone for each emotion.

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS in production (required for camera API)
- Check browser camera permissions
- Try different browser (Chrome/Edge recommended)
- Verify no other app is using the camera

### Models Loading Slowly
- First load downloads ~6MB of AI models
- Models are cached after first load
- Check your internet connection
- Try different CDN if jsdelivr is slow

### Audio Not Playing
- Click page to enable audio context (browser requirement)
- Check system volume and browser audio settings
- Try toggling music off and on again
- Some browsers require user interaction before audio

### Performance Issues
- Close other webcam applications
- Reduce browser tab count
- Try lower resolution camera settings
- Update graphics drivers

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for emotion detection
- [TensorFlow.js](https://www.tensorflow.org/js) for machine learning
- [Shadcn/UI](https://ui.shadcn.com/) for beautiful components
- [Vercel](https://vercel.com) for deployment platform

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## 🌟 Features Roadmap

- [ ] Emotion timeline graph with Chart.js
- [ ] Multiple face detection support
- [ ] Emotion history export (CSV/JSON)
- [ ] Custom theme creator
- [ ] Video recording with emotion overlay
- [ ] Social sharing features
- [ ] Mobile app version

---

**Built with ❤️ using Next.js, TypeScript, and AI**

*Experience emotions like never before at [your-demo-url.vercel.app](https://your-demo-url.vercel.app)*