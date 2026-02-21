from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import date

app = Flask(__name__)
CORS(app)

# database 
friendship = {
    "user1_last_date": None,
    "user2_last_date": None,
    "streak_count": 0
}

@app.route('/')
def home():
    # templates folder
    return render_template('index.html')

@app.route('/complete_quiz', methods=['POST'])
def complete_quiz():
    global friendship
    data = request.json
    u_id = data.get('user_id')
    today = str(date.today())
    
    streak_increased = False
    
    # Update the date for the specific user
    if u_id == "user1":
        friendship["user1_last_date"] = today
    elif u_id == "user2":
        friendship["user2_last_date"] = today
        
    # Check if user a and b finished today
    if friendship["user1_last_date"] == today and friendship["user2_last_date"] == today:
        friendship["streak_count"] += 1
        streak_increased = True
        # For testing: we reset to "done" so they don't double-trigger
        friendship["user1_last_date"] = "DONE"
        friendship["user2_last_date"] = "DONE"

    return jsonify({
        "streak_increased": streak_increased,
        "streak_count": friendship["streak_count"],
        "message": "Streak Up!" if streak_increased else "Waiting for partner..."
    })

# RESET  http://127.0.0.1:5001/reset 
@app.route('/reset')
def reset():
    global friendship
    friendship = {"user1_last_date": None, "user2_last_date": None, "streak_count": 0}
    return "Streak reset to 0!"

if __name__ == '__main__':
    app.run(debug=True, port=5001)