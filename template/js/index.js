$(function () {
    var questionNumber = $('.question-number');
    var stem = $('.stem');
    var explanationRow = $('.explanation-row');
    var explanation = $('.explanation');
    var questionImage = $('.question-image');
    var options = $('.simple-radio');
    var optionRadios = $('.simple-radio > input');
    var optionLabels = $('.simple-radio > label');
    var previousButton = $('#previous_button');
    var nextButton = $('#next_button');
    var resultButton = $('#result_button');
    var questionButton = $('#question_button');

    var questionContainer = $('.question-container');
    var resultContainer = $('.result-container');

    var ctx = $(".result-graph").get(0).getContext("2d");
    var chart = new Chart(ctx).Doughnut([], {responsive: true, percentageInnerCutout: 80});

    var startTime;

    previousButton.click(previousQuestion);
    nextButton.click(nextQuestion);
    resultButton.click(showResultContainer);
    questionButton.click(showQuestionContainer);

    optionRadios.change(onOptionSelected);

    startTest();

    function startTest() {
	shuffle(questions);
	$('.num-questions').html(questions.length);

	setCurrentQuestionIndex(0);
	showCurrentQuestion();
	showQuestionContainer();

	startTime = new Date();
    }
    
    function showCurrentQuestion() {
	questionNumber.html(getCurrentQuestionIndex() + 1);

	var data = getCurrentQuestion();

	stem.html(data.stem);

	explanationRow.hide();
	if (data.explanation) {
	    explanation.html(data.explanation);
	}

	if (data.images) {
	    var image = data.images[0];
	    questionImage.removeClass("small medium large extend");
	    questionImage.addClass(image.size);

	    questionImage.attr('src', '');
	    questionImage.attr('src', 'images/' + image.image);

	    questionImage.attr('alt', image.alt);
	    questionImage.show();
	} else {
	    questionImage.hide();
	}

	options.hide();
	optionRadios.prop('checked', false);
	for (var i = 0; i < data.options.length; i++) {
	    options.eq(i).show();
	    optionLabels.eq(i).html(data.options[i]);
	}

	optionLabels.removeClass('text-danger text-success');
	optionRadios.prop('disabled', false);

	if (typeof data.answer != 'undefined') {
	    showAnswer(false);
	}

	if (hasPreviousQuestion()) {
	    previousButton.show();
	} else {
	    previousButton.hide();
	}

	if (hasNextQuestion()) {
	    nextButton.show();
	} else {
	    nextButton.hide();
	}
    }

    function showQuestionContainer() {
	resultContainer.hide();
	questionContainer.show();
    }

    function showResultContainer() {
	resultContainer.show();
	questionContainer.hide();

	var numAnswered = 0;
	var numCorrect = 0;
	for (var i = 0; i < getNumberOfQuestions(); i++) {
	    var q = getQuestion(i);
	    if (typeof q.answer != 'undefined') {
		numAnswered++;
		if (q.answer === q.key) {
		    numCorrect++;
		}
	    }
	}

	$('.num-correct').html(numCorrect);
	$('.num-wrong').html(numAnswered - numCorrect);

	var seconds = Math.ceil((new Date() - startTime) / 1000)
	var minutes = Math.ceil(seconds / 60);
	$('.time-spent').html(minutes);

	var percent = 0;
	if (numAnswered > 0) {
	    percent = Math.ceil((numCorrect * 100) / numAnswered);
	}

	var allowedTime = 43 * numAnswered;

	var outcome = $('.outcome');
	outcome.removeClass('text-success text-danger');
	if (seconds < allowedTime && percent >= 80) {
	    outcome.addClass('text-success');
	    outcome.html('godkänd');
	} else {
	    outcome.addClass('text-danger');
	    outcome.html('underkänd');
	}

	$('.result-percent').html(percent + '<span class="small">%</span>');

	chart.removeData();
	chart.removeData();

	chart.addData({
	    value: numCorrect,
	    color: "#46BFBD",
	    highlight: "#5AD3D1",
	    label: "Rätt"
	});

	chart.addData({
            value: (numAnswered - numCorrect),
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Fel"
	});

	chart.update();
    }

    function onOptionSelected(event) {
	var value = parseInt($(this).val(), 10);
	getCurrentQuestion().answer = value - 1;
	showAnswer(true);
    }

    function showAnswer(animate) {
	var data = getCurrentQuestion();
	var key = data.key;
	var answer = data.answer;

	optionRadios.eq(answer).prop('checked', true);

	optionLabels.eq(key).addClass('text-success')
	    .append(' <span class="glyphicon glyphicon-ok"></span>');
	if (answer !== key) {
	    optionLabels.eq(answer).addClass('text-danger')
		.append(' <span class="glyphicon glyphicon-remove"></span>');
	}
	
	optionRadios.prop('disabled', true);

	if (data.explanation) {
	    if (animate) {
		explanationRow.slideToggle();
	    } else {
		explanationRow.show();
	    }
	}
    }

    function getCurrentQuestion() {
	return getQuestion(getCurrentQuestionIndex());
    }

    function getQuestion(index) {
	return questions[index].data;
    }

    function nextQuestion() {
	if (hasNextQuestion()) {
	    setCurrentQuestionIndex(getCurrentQuestionIndex() + 1);
	    showCurrentQuestion();
	}
    }

    function previousQuestion() {
	if (hasPreviousQuestion()) {
	    setCurrentQuestionIndex(getCurrentQuestionIndex() - 1);
	    showCurrentQuestion();
	}
    }

    var currentQuestionIndex = 0;
    function setCurrentQuestionIndex(index) {
	currentQuestionIndex = index;
    }

    function getCurrentQuestionIndex() {
	return currentQuestionIndex;
    }

    function hasPreviousQuestion() {
	return getCurrentQuestionIndex() > 0;
    }

    function hasNextQuestion() {
	return getCurrentQuestionIndex() < getNumberOfQuestions() - 1;
    }

    function getNumberOfQuestions() {
	return questions.length;
    }

    function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
    }
});

var questions = 
