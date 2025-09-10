from flask import Flask, request, jsonify, render_template, send_file
import os
import tempfile
import uuid
from werkzeug.utils import secure_filename
from nuance_generator import SongNuanceGenerator
import json

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Initialize the generator
generator = SongNuanceGenerator("samples")

# Allowed file extensions
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_song():
    """Analyze a song and return the analysis results"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not supported'}), 400
    
    try:
        # Create temporary file
        temp_id = str(uuid.uuid4())
        temp_input = f"/tmp/input_{temp_id}.wav"
        file.save(temp_input)
        
        # Analyze the song
        analysis = generator.analyze_song(temp_input)
        events = generator.schedule_nuances(analysis)
        
        # Clean up
        os.remove(temp_input)
        
        return jsonify({
            'success': True,
            'analysis': {
                'tempo': float(analysis['tempo']) if hasattr(analysis['tempo'], '__iter__') else analysis['tempo'],
                'duration': analysis['duration'],
                'num_beats': len(analysis['beats']),
                'num_sections': len(analysis['sections'])
            },
            'events': len(events),
            'preview_events': events[:10]  # Show first 10 events
        })
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_input):
            os.remove(temp_input)
        return jsonify({'error': str(e)}), 500

@app.route('/api/process', methods=['POST'])
def process_song():
    """Process a song and add nuances with parameters"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not supported'}), 400
    
    try:
        # Get parameters from form data
        params = {}
        if 'creativity_level' in request.form:
            params['creativity_level'] = float(request.form['creativity_level'])
        if 'nuance_density' in request.form:
            params['nuance_density'] = float(request.form['nuance_density'])
        if 'intensity' in request.form:
            params['intensity'] = float(request.form['intensity'])
        if 'texture_preference' in request.form:
            params['texture_preference'] = float(request.form['texture_preference'])
        if 'randomness' in request.form:
            params['randomness'] = float(request.form['randomness'])
        if 'stereo_width' in request.form:
            params['stereo_width'] = float(request.form['stereo_width'])
        if 'vintage_mode' in request.form:
            params['vintage_mode'] = request.form['vintage_mode'].lower() == 'true'
        
        # Create temporary files
        temp_id = str(uuid.uuid4())
        temp_input = f"/tmp/input_{temp_id}.wav"
        temp_output = f"/tmp/output_{temp_id}.wav"
        
        file.save(temp_input)
        
        # Process the song with parameters
        result = generator.process_song(temp_input, temp_output, params)
        
        # Clean up input
        os.remove(temp_input)
        
        # Return the processed file
        return send_file(
            temp_output, 
            as_attachment=True,
            download_name=f"enhanced_{secure_filename(file.filename)}",
            mimetype='audio/wav'
        )
    
    except Exception as e:
        # Clean up on error
        for temp_file in [temp_input, temp_output]:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        return jsonify({'error': str(e)}), 500

@app.route('/api/status')
def status():
    """Get the status of the generator"""
    sample_counts = {k: len(v) for k, v in generator.catalog.samples.items()}
    return jsonify({
        'status': 'ready',
        'samples_loaded': sample_counts,
        'total_samples': sum(sample_counts.values())
    })

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5001)
