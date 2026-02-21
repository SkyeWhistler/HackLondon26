from flask import Flask, request, redirect, render_template, jsonify

app = Flask(__name__)

live_progress = {}

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
    },
    {
        "q": "What type of bond involves the sharing of electron pairs between atoms?",
        "opts": ["Ionic bond", "Hydrogen bond", "Covalent bond", "Metallic bond"],
        "ans": 2
    }
]

@app.route("/")
def lobby():
    return render_template("lobby.html")

@app.route("/progress")
def get_progress():
    return jsonify(live_progress)

@app.route("/leaderboard-data")
def get_leaderboard_data():
    return jsonify({
        player: {
            "score": info.get("score", 0),
            "avatar": info.get("avatar", "🦊"),
            "finished": info.get("finished", False)
        }
        for player, info in live_progress.items()
    })

@app.route("/start")
def start_quiz():
    player = request.args.get("player", "Anonymous")
    avatar = request.args.get("avatar", "🦊")
    return redirect(f"/q/0?player={player}&score=0&avatar={avatar}")

@app.route("/q/<int:q_id>")
def serve_question(q_id):
    score = int(request.args.get("score", 0))
    player = request.args.get("player", "Anonymous")
    avatar = request.args.get("avatar", "🦊")

    if q_id >= len(questions):
        live_progress[player] = {"pct": 100, "avatar": avatar, "score": score, "finished": True, "q_num": len(questions), "total": len(questions)}
        sorted_board = sorted(
            [(p, {"score": i.get("score", 0), "avatar": i.get("avatar", "🦊"), "finished": i.get("finished", False)})
             for p, i in live_progress.items()],
            key=lambda x: x[1]["score"], reverse=True
        )
        return render_template("leaderboard.html", leaderboard=sorted_board, current_player=player)

    progress_percentage = (q_id / len(questions)) * 100
    live_progress[player] = {"pct": progress_percentage, "avatar": avatar, "score": score, "finished": False, "q_num": q_id, "total": len(questions)}

    return render_template("quiz.html",
                           question=questions[q_id],
                           progress=progress_percentage,
                           score=score,
                           player=player,
                           avatar=avatar,
                           next_q_id=q_id + 1,
                           live_progress=live_progress)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5001)
