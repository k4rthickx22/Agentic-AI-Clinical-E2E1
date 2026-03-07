import speech_recognition as sr

def get_voice_input():
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        print("Listening... Please speak your symptoms")

        recognizer.adjust_for_ambient_noise(source, duration=1)

        try:
            audio = recognizer.listen(
                source,
                timeout=None,              # wait until speech starts
                phrase_time_limit=10       # allow longer sentence
            )

            text = recognizer.recognize_google(audio)

            return text

        except sr.UnknownValueError:
            return "Sorry, I could not understand."

        except sr.RequestError:
            return "Speech service unavailable."

        except Exception as e:
            return f"Voice input error: {str(e)}"