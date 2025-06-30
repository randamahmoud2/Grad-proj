
from flask import Flask
from flask_sock import Sock
import whisper
import numpy as np
import io
import soundfile as sf
# from gevent import pywsgi
# from geventwebsocket.handler import WebSocketHandler

app = Flask(__name__)
sock = Sock(app)
model = whisper.load_model("base")

@app.route('/')
def home():
    return "Whisper WebSocket Server"

@sock.route('/transcribe')
def transcribe(ws):
    print("WebSocket connection established")
    audio_buffer = io.BytesIO()
    sample_rate = 16000
    
    try:
        while True:
            data = ws.receive()
            
            if isinstance(data, bytes):
                # Accumulate audio data
                audio_buffer.write(data)
                
                # Process when we have enough audio (~3 seconds)
                if audio_buffer.tell() >= sample_rate * 2 * 3:  # 16kHz * 2 bytes * 3 seconds
                    audio_buffer.seek(0)
                    
                    # Convert to numpy array
                    audio_np = np.frombuffer(audio_buffer.read(), dtype=np.int16).astype(np.float32) / 32768.0
                    
                    # Transcribe with proper parameters
                    result = model.transcribe(
                        audio_np,
                        fp16=False,
                        language='en',
                        temperature=0.0,  # Reduce randomness
                        best_of=5,       # Better quality
                        beam_size=5      # Better quality
                    )
                    
                    transcript = result["text"].strip()
                    if transcript:
                        print("Sending transcript:", transcript)
                        ws.send(transcript)
                    
                    # Reset buffer, keeping last 1 second for context
                    remaining = max(0, audio_buffer.tell() - sample_rate * 2 * 1)
                    audio_buffer = io.BytesIO(audio_buffer.read(remaining))
                    
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
    finally:
        print("WebSocket connection closed")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

    # server = pywsgi.WSGIServer(('0.0.0.0', 5000), app, handler_class=WebSocketHandler)
    # server.serve_forever()

