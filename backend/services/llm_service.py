import os
from groq import Groq
from dotenv import load_dotenv
# create a function to analyze symptoms using groq
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_llm(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",                
        messages=[
            {"role": "user", "content": prompt}
            
        ],
        temperature=0.3
    )
    

    return response.choices[0].message.content
