from flask import Flask, request, redirect, render_template

app = Flask(__name__)

leaderboard = {}

questions = [
    {
        "q": "What is the crucial role of the enzyme RuBisCO during the Calvin cycle?",
        "opts": ["Reducing NADP+ to NADPH", "Synthesising ATP", "Catalysing the initial fixation of carbon dioxide to RuBP", "Splitting water molecules"],
        "ans": 2
    },
    {
        "q": "Which cellular organelle is the primary site of cellular respiration?",
        "opts": ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        "ans": 1
    }
]

@app.route("/")
def lobby():
    # Looks for templates/lobby.html
    return render_template("lobby.html")

@app.route("/start")
def start_quiz():
    player = request.args.get("player", "Anonymous")
    return redirect(f"/q/0?player={player}&score=0")

@app.route("/q/<int:q_id>")
def serve_question(q_id):
    score = int(request.args.get("score", 0))
    player = request.args.get("player", "Anonymous")
    
    # If quiz is over, show leaderboard
    if q_id >= len(questions):
        leaderboard[player] = score
        sorted_board = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)
        return render_template("leaderboard.html", leaderboard=sorted_board, current_player=player)

    # Otherwise, serve the current question
    current_q = questions[q_id]
    progress_percentage = (q_id / len(questions)) * 100
    
    return render_template("quiz.html", 
                           question=current_q, 
                           progress=progress_percentage, 
                           score=score, 
                           player=player, 
                           next_q_id=q_id + 1)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)
