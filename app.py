from flask import Flask, request, redirect

app = Flask(__name__)

# 1. Define your 5 questions
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
    },
    {
        "q": "In computer science, what does 'HTTP' stand for?",
        "opts": ["HyperText Transfer Protocol", "HyperText Transmission Process", "Hyperlink Transfer Technology", "HyperText Terminal Protocol"],
        "ans": 0
    },
    {
        "q": "Which law states that for every action, there is an equal and opposite reaction?",
        "opts": ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Universal Gravitation"],
        "ans": 2
    }
]

# 2. Redirect the root URL to the first question
@app.route("/")
def start_quiz():
    return redirect("/q/0?score=0")

# 3. Dynamic route for each question
@app.route("/q/<int:q_id>")
def serve_question(q_id):
    score = float(request.args.get("score", 0))
    
    # Check if we've finished all questions
    if q_id >= len(questions):
        return f"""
        <body style="background: linear-gradient(135deg, #2a1f4c, #4a3b7d); color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
            <div style="text-align: center; background: #1c1433; padding: 40px; border-radius: 24px;">
                <h1>Quiz Complete! 🎉</h1>
                <p style="font-size: 24px; margin-top: 20px;">Final Score: {score} / {len(questions)}</p>
                <a href="/" style="display: inline-block; margin-top: 30px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Restart</a>
            </div>
        </body>
        """

    # Get the current question data
    current_q = questions[q_id]
    progress_percentage = (q_id / len(questions)) * 100
    next_q_id = q_id + 1
    
    # 4. Inject variables smoothly into the HTML/JS using f-strings
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hackathon Quiz</title>
        <style>
            * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }}
            body {{ background: linear-gradient(135deg, #2a1f4c, #4a3b7d); display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #ffffff; }}
            .quiz-app {{ width: 100%; max-width: 400px; background-color: #1c1433; border-radius: 24px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-height: 600px; display: flex; flex-direction: column; }}
            .quiz-header {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; margin-top: 10px; }}
            .back-btn {{ background: #342654; border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; }}
            .progress-container {{ flex-grow: 1; background-color: #342654; height: 10px; border-radius: 10px; margin: 0 15px; overflow: hidden; }}
            .progress-bar {{ background-color: #8c7ae6; height: 100%; border-radius: 10px; width: {progress_percentage}%; transition: width 0.3s; }}
            .score-pill {{ background-color: #3b82f6; padding: 6px 12px; border-radius: 16px; font-weight: bold; font-size: 14px; }}
            .quiz-content h1 {{ font-size: 20px; line-height: 1.4; margin-bottom: 30px; text-align: center; font-weight: 600; }}
            .options-container {{ display: flex; flex-direction: column; gap: 15px; }}
            .option-btn {{ background-color: #382c59; color: #e0dced; border: none; padding: 20px; border-radius: 12px; font-size: 15px; text-align: left; cursor: pointer; transition: background-color 0.2s ease; line-height: 1.3; }}
            .option-btn:active {{ transform: scale(0.98); }}
            .option-btn.correct {{ background-color: #7ac16c; color: white; }}
            .option-btn.wrong {{ background-color: #e74c3c; color: white; }}
            .option-btn:disabled {{ cursor: not-allowed; opacity: 0.9; }}
        </style>
    </head>
    <body>
        <div class="quiz-app">
            <header class="quiz-header">
                <button class="back-btn" onclick="window.location.href='/'">←</button>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
                <div class="score-pill">Score: {int(score)}</div>
            </header>
            <main class="quiz-content">
                <h1>{current_q['q']}</h1>
                <div class="options-container" id="options-container"></div>
            </main>
        </div>

        <script>
            const options = {current_q['opts']};
            const correctIndex = {current_q['ans']};
            const currentScore = {int(score)};
            const nextQuestionId = {next_q_id};
            const container = document.getElementById('options-container');

            options.forEach((optText, index) => {{
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = optText;
                
                btn.onclick = () => {{
                    // 1. Lock all buttons
                    const allBtns = document.querySelectorAll('.option-btn');
                    allBtns.forEach(b => b.disabled = true); 
                    
                    // 2. Update the score and apply styling
                    let newScore = currentScore;
                    if (index === correctIndex) {{
                        btn.classList.add('correct');
                        newScore += 1;
                    }} else {{
                        btn.classList.add('wrong');
                        allBtns[correctIndex].classList.add('correct'); 
                    }}
                    
                    // 3. Move to the next question
                    setTimeout(() => {{
                        window.location.href = "/q/" + nextQuestionId + "?score=" + newScore;
                    }}, 1500);
                }};
                container.appendChild(btn);
            }});
        </script>
    </body>
    </html>
    """
    return html_content

if __name__ == "__main__":
    app.run(debug=True, port=5000)