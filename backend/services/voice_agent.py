import speech_recognition as sr
import pyttsx3


class VoiceAgent:

    def __init__(self):

        self.recognizer = sr.Recognizer()

        self.engine = pyttsx3.init()

    def listen(self):

        with sr.Microphone() as source:

            print("🎤 Speak your symptoms...")

            audio = self.recognizer.listen(source)

        try:

            text = self.recognizer.recognize_google(audio)

            print("You said:", text)

            return text

        except:

            return "Could not understand audio"

    def speak(self, text):

        self.engine.say(text)

        self.engine.runAndWait()