import csv
import random
from typing import List, Dict

def note_to_value(note: str) -> int:
    # 샤프 표기를 위한 딕셔너리
    note_order = {
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
        'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    }
    # 플랫 표기를 샤프로 변환하는 매핑
    flat_to_sharp = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    }
    
    # 유니코드 플랫 기호(♭)를 일반 플랫 표기(b)로 변환
    note = note.replace('♭', 'b')
    
    # 음표와 옥타브 분리 (옥타브가 한 자리라고 가정)
    pitch, octave = note[:-1], int(note[-1])
    if pitch in flat_to_sharp:
        pitch = flat_to_sharp[pitch]
    return octave * 12 + note_order[pitch]


def filter_notes_by_genre(csv_file: str, user_highest_note: str) -> List[Dict]:
    target_value = note_to_value(user_highest_note)
    genre_data = {genre: [] for genre in ['K-POP', 'POP', 'R&B', '발라드', '밴드']}
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = list(csv.DictReader(file))
        random.shuffle(reader) 
        
        for row in reader:
            row_value = note_to_value(row['highest_note'])
            genre = row['genre']
            
            if genre in genre_data and row_value <= target_value:
                if len(genre_data[genre]) < 3:
                    genre_data[genre].append(row)
                else:
                    min_value = min(genre_data[genre], key=lambda x: note_to_value(x['highest_note']))
                    if note_to_value(min_value['highest_note']) < row_value:
                        genre_data[genre].remove(min_value)
                        genre_data[genre].append(row)
    
    return [item for sublist in genre_data.values() for item in sorted(sublist, key=lambda x: note_to_value(x['highest_note']), reverse=True)]

def process_music_data(csv_file_path: str, user_highest_note: str) -> List[Dict]:
    filtered_data = filter_notes_by_genre(csv_file_path, user_highest_note)
    return filtered_data