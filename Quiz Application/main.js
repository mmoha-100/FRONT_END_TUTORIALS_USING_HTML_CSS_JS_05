function fetchJsonFiles(category) {
    return fetch(`json/${category}.json`);
}

// Main Vars:
const Container = document.querySelector(".container");
const StartPage = document.querySelector(".starting-page");
const CategoryPage = document.querySelector(".choosing-category");
const QuestionsPage = document.querySelector(".questions-box");

// Buttons:
const StartBtn = document.querySelector(".start-quiz");
const Categories = document.querySelectorAll(
    ".choosing-category .choices .btn"
);

Categories.forEach((e) => {
    e.addEventListener("click", () => {
        chooseQuestions(e.classList[1]);
    });
});

StartBtn.onclick = function () {
    document.title = "Choosing The Category";
    chooseCategory();
};

function chooseCategory() {
    StartPage.classList.add("d-none");
    CategoryPage.classList.remove("d-none");
}

function fetchQuestions(category) {
    fetchJsonFiles(category)
        .then((response) => response.json())
        .then((data) => {
            document.title = `Category: ${category.toUpperCase()}`;
            generateQuestions(data);
        })
        .catch((error) =>
            console.error(`Error fetching ${category} JSON files:`, error)
        );
}

function chooseQuestions(category) {
    const validCategories = ["general", "html", "css", "js", "php", "python"];

    if (validCategories.includes(category)) {
        fetchQuestions(category);
    } else {
        console.error(`Invalid category: ${category}`);
    }
}

// Comments Are Really Important Here :)
function generateQuestions(data) {
    let currentQuestionIndex = 0;
    let score = 0;

    // Hide All Questions Initially
    const hideAllQuestions = () => {
        const allQuestions = document.querySelectorAll(".questions-box");
        allQuestions.forEach((question) => question.classList.add("d-none"));
    };

    // Show Current Question
    const showQuestion = (index) => {
        hideAllQuestions();
        const currentQuestion = document.querySelector(`#question-${index}`);
        if (currentQuestion) {
            currentQuestion.classList.remove("d-none");
        }
    };

    // Function To Check The Answer
    const checkAnswer = (index, correctAnswer) => {
        const selectedAnswer = document.querySelector(
            `input[name="chosen-answer-${index}"]:checked`
        );
        if (selectedAnswer && selectedAnswer.value === correctAnswer) {
            score++;
            document.querySelector(".yes").play();
        }
        // else {
        //      document.querySelector(".no").play();
        // }
    };

    // Function To Show Final Result
    const showResult = () => {
        hideAllQuestions();
        let resultContainer = document.createElement("div");
        resultContainer.className = "page result-container";
        resultContainer.innerHTML = `<p class="result">Your Score: ${score} / ${
            data.questions.length
        }</p>${
            score >= data.questions.length / 2
                ? '<span class="good">Congratulations!</span>'
                : '<span class="bad">Sorry!</span>'
        }`;

        // Create and Append Restart Button
        let restartBtn = document.createElement("button");
        restartBtn.innerHTML = "Restart Quiz";
        restartBtn.className = "btn";
        restartBtn.addEventListener("click", () => {
            window.location.reload(); // Reload The Page To Restart The Quiz
        });
        resultContainer.append(restartBtn);

        Container.append(resultContainer);
    };

    data.questions.forEach((questionObj, index) => {
        // Extract The Question Text And Answers
        const questionText = questionObj.question;
        const correctAnswer = questionObj.correctAnswer;
        const wrongAnswers = questionObj.wrongAnswers;

        // Create The Question Container
        let questionContainer = document.createElement("div");
        questionContainer.setAttribute("class", "page questions-box d-none");
        questionContainer.setAttribute("id", `question-${index}`);

        // Create The Question Paragraph
        let questionParagraph = document.createElement("p");
        let thQuestion = `Question ${index + 1}: ${questionText}`;
        questionParagraph.innerHTML = thQuestion;
        questionContainer.append(questionParagraph);

        // Create Choices Container
        let choices = document.createElement("div");
        choices.className = "choices";

        // Create Form For The Choices
        let form = document.createElement("form");
        choices.appendChild(form);

        // Combine Correct And Wrong Answers
        let allAnswers = [...wrongAnswers, correctAnswer];
        // Shuffle The Answers
        allAnswers.sort(() => Math.random() - 0.5);

        // Create Radio Buttons For Each Answer
        allAnswers.forEach((answer, i) => {
            let div = document.createElement("div");

            let inp = document.createElement("input");
            inp.type = "radio";
            inp.id = `answer${index}-${i + 1}`;
            inp.name = `chosen-answer-${index}`;
            inp.value = answer;

            let label = document.createElement("label");
            label.htmlFor = inp.id;
            label.innerHTML = answer;

            div.append(inp);
            div.append(label);
            form.append(div);
        });

        questionContainer.append(choices);

        // Create And Append Next Button
        let nextBtn = document.createElement("button");
        nextBtn.innerHTML = "Next Question";
        nextBtn.className = "btn";
        nextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            checkAnswer(index, correctAnswer);
            currentQuestionIndex++;
            if (currentQuestionIndex < data.questions.length) {
                showQuestion(currentQuestionIndex);
            } else {
                showResult();
            }
        });
        questionContainer.append(nextBtn);

        Container.append(questionContainer);
    });

    // Show The First Question Initially
    showQuestion(currentQuestionIndex);
}
