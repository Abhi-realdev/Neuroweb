"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, CameraOff, Download, Music, Volume2, VolumeX, Star, Trophy, Zap, Award, Sparkles, Target, TrendingUp, Users, Code, Palette, Brain, Megaphone } from "lucide-react";

// Emotion configuration with themes and audio frequencies
const EMOTION_CONFIG = {
  happy: {
    name: "Happy",
    emoji: "😊",
    gradient: "linear-gradient(135deg, #FFA500 0%, #FFD700 100%)",
    color: "#FFA500",
    glow: "0 0 40px rgba(255, 165, 0, 0.6)",
    frequency: 440,
    narration: "You look joyful! Your happiness lights up the screen!",
    fact: "Smiling can make you feel happier! Your brain releases feel-good chemicals when you smile.",
    points: 10,
  },
  sad: {
    name: "Sad",
    emoji: "😢",
    gradient: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
    color: "#3B82F6",
    glow: "0 0 40px rgba(59, 130, 246, 0.6)",
    frequency: 220,
    narration: "I sense some heaviness. Take a deep breath and breathe slow.",
    fact: "It's okay to feel sad sometimes. Talking about your feelings helps you feel better!",
    points: 15,
  },
  angry: {
    name: "Angry",
    emoji: "😠",
    gradient: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    color: "#DC2626",
    glow: "0 0 40px rgba(220, 38, 38, 0.6)",
    frequency: 120,
    narration: "Let's cool down the interface. Take it easy.",
    fact: "Taking deep breaths and counting to 10 can help calm angry feelings!",
    points: 15,
  },
  fearful: {
    name: "Fearful",
    emoji: "😨",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
    color: "#7C3AED",
    glow: "0 0 40px rgba(124, 58, 237, 0.6)",
    frequency: 320,
    narration: "Everything is okay. You're in a safe space.",
    fact: "Being brave doesn't mean not being scared - it means facing your fears!",
    points: 20,
  },
  disgusted: {
    name: "Disgusted",
    emoji: "🤢",
    gradient: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    color: "#10B981",
    glow: "0 0 40px rgba(16, 185, 129, 0.6)",
    frequency: 160,
    narration: "Let's refresh the environment for you.",
    fact: "Feeling disgusted helps protect us from things that might be harmful!",
    points: 15,
  },
  surprised: {
    name: "Surprised",
    emoji: "😲",
    gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
    color: "#F97316",
    glow: "0 0 40px rgba(249, 115, 22, 0.6)",
    frequency: 520,
    narration: "Something caught your attention! How exciting!",
    fact: "Surprise helps us pay attention to new and important things in our environment!",
    points: 10,
  },
  neutral: {
    name: "Neutral",
    emoji: "😐",
    gradient: "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
    color: "#9CA3AF",
    glow: "0 0 40px rgba(156, 163, 175, 0.6)",
    frequency: 280,
    narration: "Welcome to NeuraWeb. I'm reading your emotions.",
    fact: "Neutral is a calm, balanced state. It's great for learning and focusing!",
    points: 5,
  },
};

type Emotion = keyof typeof EMOTION_CONFIG;

interface EmotionLog {
  emotion: Emotion;
  confidence: number;
  timestamp: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

// Student team data
const TEAM_MEMBERS = [
  {
    name: "Student Name 1",
    role: "Project Lead & AI Developer",
    icon: <Brain className="w-8 h-8" />,
    color: "#FF6B6B",
  },
  {
    name: "Student Name 2",
    role: "Frontend Developer",
    icon: <Code className="w-8 h-8" />,
    color: "#4ECDC4",
  },
  {
    name: "Student Name 3",
    role: "UI/UX Designer",
    icon: <Palette className="w-8 h-8" />,
    color: "#95E1D3",
  },
  {
    name: "Student Name 4",
    role: "Backend Developer",
    icon: <Zap className="w-8 h-8" />,
    color: "#F38181",
  },
  {
    name: "Student Name 5",
    role: "Marketing & Content",
    icon: <Megaphone className="w-8 h-8" />,
    color: "#AA96DA",
  },
];

export default function NeuraWeb() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const detectionLoopRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [confidence, setConfidence] = useState(0);
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>([]);
  const [sensitivity, setSensitivity] = useState([50]);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [narrationEnabled, setNarrationEnabled] = useState(false);
  const [error, setError] = useState<string>("");

  // Gamification states
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [emotionsDetected, setEmotionsDetected] = useState<Set<Emotion>>(new Set());
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first_smile", name: "First Smile", description: "Detect your first happy emotion", icon: <Star className="w-6 h-6" />, unlocked: false, progress: 0, target: 1 },
    { id: "emotion_explorer", name: "Emotion Explorer", description: "Detect 5 different emotions", icon: <Sparkles className="w-6 h-6" />, unlocked: false, progress: 0, target: 5 },
    { id: "streak_master", name: "Streak Master", description: "Reach a 10 emotion streak", icon: <Zap className="w-6 h-6" />, unlocked: false, progress: 0, target: 10 },
    { id: "emotion_master", name: "Emotion Master", description: "Detect all 7 emotions", icon: <Trophy className="w-6 h-6" />, unlocked: false, progress: 0, target: 7 },
    { id: "point_collector", name: "Point Collector", description: "Earn 100 points", icon: <Target className="w-6 h-6" />, unlocked: false, progress: 0, target: 100 },
    { id: "level_up", name: "Rising Star", description: "Reach level 5", icon: <TrendingUp className="w-6 h-6" />, unlocked: false, progress: 0, target: 5 },
  ]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [showFact, setShowFact] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Use refs for values needed in detection loop
  const currentEmotionRef = useRef<Emotion>("neutral");
  const sensitivityRef = useRef<number>(50);
  const musicEnabledRef = useRef<boolean>(false);
  const narrationEnabledRef = useRef<boolean>(false);

  // Keep refs in sync with state
  useEffect(() => {
    currentEmotionRef.current = currentEmotion;
  }, [currentEmotion]);

  useEffect(() => {
    sensitivityRef.current = sensitivity[0];
  }, [sensitivity]);

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
  }, [musicEnabled]);

  useEffect(() => {
    narrationEnabledRef.current = narrationEnabled;
  }, [narrationEnabled]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading models:", err);
        setError("Failed to load AI models. Please refresh the page.");
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Level up check
  useEffect(() => {
    const pointsForNextLevel = level * 50;
    if (totalPoints >= pointsForNextLevel) {
      setLevel((prev) => prev + 1);
      triggerConfetti();
      playSuccessSound();
      checkAchievements("level", level + 1);
    }
  }, [totalPoints, level]);

  const fetchAvailableCameras = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      setAvailableCameras(cameras);
      setSelectedCameraId((prev) => {
        if (prev && cameras.some((camera) => camera.deviceId === prev)) {
          return prev;
        }
        return cameras[0]?.deviceId ?? null;
      });
    } catch (err) {
      console.error("Failed to enumerate cameras:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

    fetchAvailableCameras();

    const handleDeviceChange = () => {
      fetchAvailableCameras();
    };

    if (navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    } else {
      navigator.mediaDevices.ondevicechange = handleDeviceChange;
    }

    return () => {
      if (navigator.mediaDevices.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
      } else {
        navigator.mediaDevices.ondevicechange = null;
      }
    };
  }, [fetchAvailableCameras]);

  // Start/Stop Camera
  const toggleCamera = useCallback(async () => {
    console.log("toggleCamera clicked, isCameraActive:", isCameraActive);
    if (isCameraActive) {
      // Stop camera logic inline to avoid dependency issues
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setIsCameraActive(false);
      }
    } else {
      await startCamera();
    }
  }, [isCameraActive]);

  const startCamera = async (deviceOverrideId?: string) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const errorMsg = "Camera API is not available in this browser.";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setError("");
      console.log("Starting camera with device:", deviceOverrideId ?? selectedCameraId);
      const targetDeviceId = deviceOverrideId ?? selectedCameraId ?? undefined;

      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 640 },
        height: { ideal: 480 },
      };

      if (targetDeviceId) {
        videoConstraints.deviceId = { exact: targetDeviceId };
      } else {
        videoConstraints.facingMode = "user";
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      const videoEl = videoRef.current;
      if (!videoEl) {
        stream.getTracks().forEach((track) => track.stop());
        setError("Video element is not ready. Please try again.");
        return;
      }

      const syncCanvasSize = () => {
        if (!canvasRef.current || !videoRef.current) return;
        if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
      };

      videoEl.srcObject = stream;
      videoEl.onloadedmetadata = () => {
        syncCanvasSize();
      };

      setIsCameraActive(true);

      try {
        await videoEl.play();
        console.log("Camera started successfully");
        syncCanvasSize();
        fetchAvailableCameras();
      } catch (playErr) {
        console.error("Error playing video:", playErr);
        setIsCameraActive(false);
        setError("Failed to start video playback. Please refresh and try again.");
        stopCamera();
        return;
      }
    } catch (err) {
      console.error("Camera error:", err);
      let message = "Unable to access the camera. Please check your permissions.";

      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            message = "Camera permission was denied. Enable it in your browser settings and retry.";
            break;
          case "NotFoundError":
            message = "No camera was found. Connect one and try again.";
            break;
          case "NotReadableError":
          case "TrackStartError":
            message = "The camera is already in use by another application.";
            break;
          case "OverconstrainedError":
            message = "The requested camera constraints are not supported by your device.";
            break;
          case "SecurityError":
            message = "Camera access requires a secure context (HTTPS or localhost).";
            break;
        }
      }

      setError(message);
    }
  };

  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (isCameraActive) {
      stopCamera();
      await startCamera(deviceId);
    }
  };

  const stopCamera = useCallback(() => {
    console.log("Stopping camera");
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  // Gamification functions
  const addPoints = (emotion: Emotion) => {
    const points = EMOTION_CONFIG[emotion].points;
    setTotalPoints((prev) => prev + points);
    setStreak((prev) => prev + 1);
    
    // Track unique emotions
    setEmotionsDetected((prev) => {
      const newSet = new Set(prev);
      newSet.add(emotion);
      return newSet;
    });

    checkAchievements("emotion", emotion);
  };

  const checkAchievements = (type: string, value: any) => {
    setAchievements((prev) => {
      return prev.map((achievement) => {
        if (achievement.unlocked) return achievement;

        let newProgress = achievement.progress;
        let shouldUnlock = false;

        switch (achievement.id) {
          case "first_smile":
            if (type === "emotion" && value === "happy") {
              newProgress = 1;
              shouldUnlock = true;
            }
            break;
          case "emotion_explorer":
            if (type === "emotion") {
              newProgress = emotionsDetected.size;
              shouldUnlock = newProgress >= 5;
            }
            break;
          case "streak_master":
            newProgress = streak;
            shouldUnlock = streak >= 10;
            break;
          case "emotion_master":
            newProgress = emotionsDetected.size;
            shouldUnlock = emotionsDetected.size >= 7;
            break;
          case "point_collector":
            newProgress = totalPoints;
            shouldUnlock = totalPoints >= 100;
            break;
          case "level_up":
            if (type === "level") {
              newProgress = value;
              shouldUnlock = value >= 5;
            }
            break;
        }

        if (shouldUnlock && !achievement.unlocked) {
          setTimeout(() => {
            setShowAchievement(achievement);
            triggerConfetti();
            playSuccessSound();
            setTimeout(() => setShowAchievement(null), 4000);
          }, 500);
          return { ...achievement, progress: newProgress, unlocked: true };
        }

        return { ...achievement, progress: newProgress };
      });
    });
  };

  const triggerConfetti = () => {
    const newConfetti: Confetti[] = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10,
        color: ["#FFD700", "#FF69B4", "#00CED1", "#FF6347", "#9370DB"][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5,
      });
    }
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  };

  const playSuccessSound = () => {
    if (!audioContextRef.current) return;
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(523, context.currentTime);
    oscillator.frequency.setValueAtTime(659, context.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, context.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  };

  // Emotion Detection Loop - Fixed with refs
  useEffect(() => {
    if (!isCameraActive || !modelsLoaded) {
      return;
    }

    console.log("Starting emotion detection loop");
    
    const detectEmotions = async () => {
      if (!videoRef.current || !canvasRef.current) {
        return;
      }

      try {
        if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
          detectionLoopRef.current = requestAnimationFrame(detectEmotions);
          return;
        }

        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks()
          .withFaceExpressions();

        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        if (detections && detections.length > 0) {
          const detection = detections[0];
          const expressions = detection.expressions;

          const displaySize = {
            width: canvasRef.current.offsetWidth,
            height: canvasRef.current.offsetHeight
          };

          const resizedDetections = faceapi.resizeResults(detection, displaySize);

          const box = resizedDetections.detection.box;
          if (ctx) {
            const currentConfig = EMOTION_CONFIG[currentEmotionRef.current];
            ctx.strokeStyle = currentConfig.color;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 15;
            ctx.shadowColor = currentConfig.color;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw emoji
            ctx.font = "48px Arial";
            ctx.fillText(currentConfig.emoji, box.x + box.width + 10, box.y + 40);
            
            console.log("Face detected and drawn");
          }

          let maxEmotion: Emotion = "neutral";
          let maxValue = 0;

          Object.entries(expressions).forEach(([emotion, value]) => {
            if (value > maxValue) {
              maxValue = value;
              maxEmotion = emotion as Emotion;
            }
          });

          console.log("Detected emotion:", maxEmotion, "confidence:", maxValue);

          const threshold = sensitivityRef.current / 100;
          if (maxValue >= threshold) {
            if (maxEmotion !== currentEmotionRef.current) {
              console.log("Emotion changed to:", maxEmotion);
              
              setCurrentEmotion(maxEmotion);
              setConfidence(Math.round(maxValue * 100));
              
              setEmotionLogs((prev) => [
                { emotion: maxEmotion, confidence: Math.round(maxValue * 100), timestamp: Date.now() },
                ...prev.slice(0, 9),
              ]);

              // Add points for emotion detection
              addPoints(maxEmotion);

              if (narrationEnabledRef.current) {
                speakNarration(maxEmotion);
              }

              if (musicEnabledRef.current) {
                updateAmbientMusic(maxEmotion);
              }

              // Show fact randomly
              if (Math.random() > 0.7) {
                setShowFact(true);
                setTimeout(() => setShowFact(false), 5000);
              }
            } else {
              setConfidence(Math.round(maxValue * 100));
            }
          }
        } else {
          console.log("No face detected");
        }
      } catch (err) {
        console.error("Detection error:", err);
      }

      detectionLoopRef.current = requestAnimationFrame(detectEmotions);
    };

    detectEmotions();

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
        detectionLoopRef.current = null;
      }
    };
  }, [isCameraActive, modelsLoaded]);

  // Speech Synthesis Narration
  const speakNarration = (emotion: Emotion) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(EMOTION_CONFIG[emotion].narration);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Audio API - Ambient Music
  const updateAmbientMusic = (emotion: Emotion) => {
    if (!audioContextRef.current) return;

    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      EMOTION_CONFIG[emotion].frequency,
      audioContextRef.current.currentTime
    );

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  };

  // Toggle music
  useEffect(() => {
    if (musicEnabled && audioContextRef.current) {
      audioContextRef.current.resume();
      updateAmbientMusic(currentEmotion);
    } else if (!musicEnabled && oscillatorRef.current) {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0,
          audioContextRef.current.currentTime + 0.5
        );
      }
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current = null;
        }
      }, 500);
    }
  }, [musicEnabled, currentEmotion]);

  // Snapshot Feature
  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, 60);
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px sans-serif";
        ctx.fillText(
          `${EMOTION_CONFIG[currentEmotion].emoji} ${EMOTION_CONFIG[currentEmotion].name} - ${confidence}%`,
          20,
          40
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `neuraweb-${currentEmotion}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  const currentConfig = EMOTION_CONFIG[currentEmotion];
  const pointsToNextLevel = level * 50;
  const levelProgress = (totalPoints % pointsToNextLevel) / pointsToNextLevel * 100;

  return (
    <div
      className="min-h-screen w-full transition-all duration-700 ease-in-out relative overflow-hidden"
      style={{
        background: currentConfig.gradient,
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: currentConfig.color,
              animation: `float-${i} ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute pointer-events-none"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: "confetti-fall 3s ease-out forwards",
          }}
        />
      ))}

      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <Card className="p-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 border-4 border-white shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="text-white">{showAchievement.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-white">🎉 Achievement Unlocked!</h3>
                <p className="text-white font-semibold">{showAchievement.name}</p>
                <p className="text-white/90 text-sm">{showAchievement.description}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fun Fact Popup */}
      {showFact && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md animate-slide-up">
          <Card
            className="p-4 backdrop-blur-xl border-2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderColor: currentConfig.color,
            }}
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: currentConfig.color }} />
              <div>
                <h4 className="font-bold text-lg mb-1" style={{ color: currentConfig.color }}>
                  Did You Know?
                </h4>
                <p className="text-gray-700 text-sm">{currentConfig.fact}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with Gamification Stats */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg animate-pulse">
            🎮 NeuraWeb 🚀
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow mb-6">
            Emotion-Sensing AI Adventure
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Card className="px-6 py-3 bg-white/20 backdrop-blur-xl border-2 border-white/50">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-300" />
                <div className="text-left">
                  <p className="text-white/80 text-xs font-medium">Level</p>
                  <p className="text-white text-2xl font-bold">{level}</p>
                </div>
              </div>
            </Card>

            <Card className="px-6 py-3 bg-white/20 backdrop-blur-xl border-2 border-white/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-orange-300" />
                <div className="text-left">
                  <p className="text-white/80 text-xs font-medium">Points</p>
                  <p className="text-white text-2xl font-bold">{totalPoints}</p>
                </div>
              </div>
            </Card>

            <Card className="px-6 py-3 bg-white/20 backdrop-blur-xl border-2 border-white/50">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-300" />
                <div className="text-left">
                  <p className="text-white/80 text-xs font-medium">Streak</p>
                  <p className="text-white text-2xl font-bold">{streak}</p>
                </div>
              </div>
            </Card>

            <Card className="px-6 py-3 bg-white/20 backdrop-blur-xl border-2 border-white/50">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-pink-300" />
                <div className="text-left">
                  <p className="text-white/80 text-xs font-medium">Achievements</p>
                  <p className="text-white text-2xl font-bold">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Level Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 relative"
                style={{ width: `${levelProgress}%` }}
              >
                <div className="absolute inset-0 animate-pulse bg-white/30"></div>
              </div>
            </div>
            <p className="text-white text-xs mt-1">
              {totalPoints % pointsToNextLevel}/{pointsToNextLevel} points to next level
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Card */}
            <Card
              className="p-6 backdrop-blur-xl border-2 transition-all duration-700 animate-card-glow"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: currentConfig.color,
                boxShadow: currentConfig.glow,
              }}
            >
              <div className="relative">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                    playsInline
                    muted
                    autoPlay
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }}
                  />

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/90 to-blue-900/90">
                      <div className="text-center text-white">
                        <CameraOff className="w-20 h-20 mx-auto mb-4 opacity-50 animate-bounce" />
                        <p className="text-lg font-bold">Camera is off</p>
                        <p className="text-sm opacity-70 mt-2">Click "Start Camera" to begin your adventure!</p>
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/90 to-blue-900/90">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                        <p className="text-lg font-bold">Loading AI models...</p>
                        <p className="text-sm opacity-70 mt-2">Preparing your emotion adventure!</p>
                      </div>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <div className="mt-4 text-center">
                    <div
                      className="inline-block px-8 py-4 rounded-full backdrop-blur-xl text-white font-bold text-3xl transition-all duration-700 animate-pulse-slow"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        boxShadow: currentConfig.glow,
                      }}
                    >
                      {currentConfig.emoji} {currentConfig.name} - {confidence}%
                    </div>
                    <div className="mt-2">
                      <Badge
                        className="text-lg px-4 py-2"
                        style={{
                          backgroundColor: currentConfig.color,
                          color: "white",
                        }}
                      >
                        +{currentConfig.points} points!
                      </Badge>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-xl border border-red-500 rounded-lg text-white">
                    {error}
                  </div>
                )}
              </div>
            </Card>

            {/* Controls */}
            <Card
              className="p-6 backdrop-blur-xl border-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: currentConfig.color,
              }}
            >
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <Button
                  onClick={() => toggleCamera()}
                  disabled={!modelsLoaded || isLoading}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-2 hover:scale-110 transition-transform"
                  style={{ borderColor: currentConfig.color }}
                >
                  {isCameraActive ? (
                    <>
                      <CameraOff className="w-5 h-5 mr-2" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Start Camera
                    </>
                  )}
                </Button>

                <Button
                  onClick={takeSnapshot}
                  disabled={!isCameraActive}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-2 hover:scale-110 transition-transform"
                  style={{ borderColor: currentConfig.color }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  📸 Snapshot
                </Button>

                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  {musicEnabled ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white" />
                  )}
                  <span className="text-white font-medium">🎵 Music</span>
                  <Switch
                    checked={musicEnabled}
                    onCheckedChange={setMusicEnabled}
                    disabled={!isCameraActive}
                  />
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Music className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">🗣️ Voice</span>
                  <Switch
                    checked={narrationEnabled}
                    onCheckedChange={setNarrationEnabled}
                    disabled={!isCameraActive}
                  />
                </div>

                <div className="flex flex-col gap-2 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors min-w-[220px]">
                  <span className="text-white font-medium text-sm">🎥 Camera Source</span>
                  <Select
                    value={selectedCameraId ?? undefined}
                    onValueChange={handleCameraChange}
                    disabled={availableCameras.length === 0}
                  >
                    <SelectTrigger className="bg-white/10 text-white border-white/30">
                      <SelectValue placeholder="Choose camera" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 text-black">
                      {availableCameras.length === 0 ? (
                        <SelectItem value="no-camera" disabled>
                          No cameras available
                        </SelectItem>
                      ) : (
                        availableCameras.map((camera, index) => (
                          <SelectItem key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${index + 1}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Dashboard Sidebar */}
          <div className="space-y-4">
            {/* Emotion Stats */}
            <Card
              className="p-6 backdrop-blur-xl border-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: currentConfig.color,
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">📊 Live Stats</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-white mb-2">
                    <span className="font-medium">Current Emotion</span>
                    <span className="font-bold text-xl">{currentConfig.emoji} {currentConfig.name}</span>
                  </div>
                  <div className="flex justify-between text-white mb-2">
                    <span className="font-medium">Confidence</span>
                    <span className="font-bold">{confidence}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full relative"
                      style={{
                        width: `${confidence}%`,
                        backgroundColor: currentConfig.color,
                      }}
                    >
                      <div className="absolute inset-0 animate-pulse bg-white/30"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">
                    🎯 Sensitivity: {sensitivity[0]}%
                  </label>
                  <Slider
                    value={sensitivity}
                    onValueChange={setSensitivity}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t border-white/20">
                  <p className="text-white/90 text-sm">
                    <strong>Unique Emotions:</strong> {emotionsDetected.size}/7
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(emotionsDetected).map((emotion) => (
                      <Badge
                        key={emotion}
                        className="text-xs"
                        style={{
                          backgroundColor: EMOTION_CONFIG[emotion].color,
                          color: "white",
                        }}
                      >
                        {EMOTION_CONFIG[emotion].emoji} {EMOTION_CONFIG[emotion].name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card
              className="p-6 backdrop-blur-xl border-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: currentConfig.color,
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Achievements</h2>
              
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg backdrop-blur transition-all ${
                      achievement.unlocked
                        ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400"
                        : "bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          achievement.unlocked ? "text-yellow-300 animate-bounce" : "text-white/50"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${achievement.unlocked ? "text-yellow-300" : "text-white"}`}>
                          {achievement.name}
                        </p>
                        <p className="text-white/70 text-xs">{achievement.description}</p>
                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="h-full bg-blue-400 rounded-full transition-all"
                                style={{
                                  width: `${(achievement.progress / achievement.target) * 100}%`,
                                }}
                              />
                            </div>
                            <p className="text-white/60 text-xs mt-1">
                              {achievement.progress}/{achievement.target}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Emotion Logs */}
            <Card
              className="p-6 backdrop-blur-xl border-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: currentConfig.color,
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">📝 Recent Emotions</h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emotionLogs.length === 0 ? (
                  <p className="text-white/70 text-center py-4">
                    No emotions detected yet. Start your adventure!
                  </p>
                ) : (
                  emotionLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{EMOTION_CONFIG[log.emotion].emoji}</span>
                        <span className="text-white font-medium">
                          {EMOTION_CONFIG[log.emotion].name}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-0"
                        >
                          {log.confidence}%
                        </Badge>
                        <p className="text-white/60 text-xs mt-1">
                          +{EMOTION_CONFIG[log.emotion].points} pts
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* All Emotions Legend */}
            <Card
              className="p-6 backdrop-blur-xl border-2"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: currentConfig.color,
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">😊 All Emotions</h2>
              
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(EMOTION_CONFIG).map(([key, config]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg backdrop-blur flex items-center justify-between transition-all ${
                      currentEmotion === key
                        ? "bg-white/30 scale-105 border-2 border-white"
                        : "bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.emoji}</span>
                      <span className="text-white font-medium">{config.name}</span>
                    </div>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: config.color,
                        color: "white",
                      }}
                    >
                      +{config.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* About Us Section */}
        <div className="mt-16 mb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Users className="w-10 h-10 text-white" />
              <h2 className="text-5xl font-bold text-white drop-shadow-lg">About Us</h2>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Meet the amazing team of students who built this emotion-sensing adventure!
            </p>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {TEAM_MEMBERS.map((member, index) => (
              <Card
                key={index}
                className="p-6 backdrop-blur-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="text-center">
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110"
                    style={{
                      backgroundColor: member.color,
                      boxShadow: `0 0 30px ${member.color}80`,
                    }}
                  >
                    <div className="text-white">{member.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-white/80 text-sm font-medium">{member.role}</p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: member.color,
                        color: "white",
                      }}
                    >
                      Team Member
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* About Website Section */}
          <Card className="p-8 md:p-12 backdrop-blur-xl border-2 border-white/30 bg-white/10 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-4">About NeuraWeb</h3>
            </div>

            <div className="space-y-6 text-white">
              <p className="text-lg leading-relaxed">
                <strong className="text-white text-xl">NeuraWeb</strong> is an innovative emotion-sensing AI website created by a talented team of students. 
                This cutting-edge project combines the power of artificial intelligence, machine learning, and modern web technologies 
                to create an interactive experience that responds to your emotions in real-time.
              </p>

              <p className="text-lg leading-relaxed">
                Using advanced facial recognition technology powered by <strong>TensorFlow.js</strong> and <strong>face-api.js</strong>, 
                NeuraWeb can detect seven different emotions: Happy, Sad, Angry, Surprised, Fearful, Disgusted, and Neutral. 
                The website dynamically adapts its theme, colors, music, and narration based on your current emotional state, 
                creating a truly personalized and immersive experience.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="text-center p-6 bg-white/10 rounded-lg border border-white/20">
                  <Trophy className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                  <h4 className="font-bold text-xl mb-2">Gamified Learning</h4>
                  <p className="text-sm text-white/80">Earn points, unlock achievements, and level up while learning about emotions!</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-lg border border-white/20">
                  <Brain className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                  <h4 className="font-bold text-xl mb-2">AI-Powered</h4>
                  <p className="text-sm text-white/80">Real-time emotion detection using advanced machine learning models.</p>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-lg border border-white/20">
                  <Sparkles className="w-10 h-10 text-pink-300 mx-auto mb-3" />
                  <h4 className="font-bold text-xl mb-2">Interactive</h4>
                  <p className="text-sm text-white/80">Dynamic themes, ambient music, and voice narration create an engaging experience.</p>
                </div>
              </div>

              <p className="text-lg leading-relaxed">
                This project was developed as a school initiative to explore the intersection of emotional intelligence and technology. 
                It serves as both an educational tool for understanding emotions and a showcase of modern web development capabilities. 
                NeuraWeb demonstrates how AI can be used to create empathetic and responsive digital experiences that enhance 
                emotional awareness and learning.
              </p>

              <div className="pt-6 border-t border-white/20 text-center">
                <p className="text-white/90 italic">
                  "Technology with a heart - Understanding emotions through AI"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: translate(-50%, -100px) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, 10px) scale(1.1);
          }
          100% {
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translate(-50%, 100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes card-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
          }
        }

        ${[...Array(20)].map((_, i) => `
          @keyframes float-${i} {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-20px) translateX(10px);
            }
            50% {
              transform: translateY(-40px) translateX(-10px);
            }
            75% {
              transform: translateY(-20px) translateX(5px);
            }
          }
        `).join('\n')}

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-card-glow {
          animation: card-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}