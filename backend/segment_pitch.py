import torchaudio
import pesto
import numpy as np
import librosa

def load_audio(file_path):
    x, sr = torchaudio.load(file_path)
    x = x.mean(dim=0)  
    return x, sr

def analyze_pitch(x, sr):
    timesteps, pitch, confidence, activations = pesto.predict(x, sr)
    audio_length = x.shape[-1] / sr
    scaled_timesteps = timesteps.numpy() * (audio_length / timesteps[-1].item())
    return scaled_timesteps, pitch, audio_length

def segment_notes(scaled_timesteps, pitch, audio_length, num_segments=7):
    segment_length = audio_length / num_segments
    segment_notes = []
    
    for i in range(num_segments):
        start_time = i * segment_length
        end_time = (i + 1) * segment_length
        
        mask = (scaled_timesteps >= start_time) & (scaled_timesteps < end_time)
        segment_valid_pitches = pitch[mask].numpy()
        
        if len(segment_valid_pitches) > 0:
            avg_pitch = np.mean(segment_valid_pitches)
            note = librosa.midi_to_note(round(12 * np.log2(avg_pitch / 440.0) + 69))
        else:
            note = "Silence"
        
        segment_notes.append(note)
    
    return segment_notes

def get_segmented_notes(file_path):
    x, sr = load_audio(file_path)
    scaled_timesteps, pitch, audio_length = analyze_pitch(x, sr)
    return segment_notes(scaled_timesteps, pitch, audio_length)
