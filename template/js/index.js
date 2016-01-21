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

    previousButton.click(previousQuestion);
    nextButton.click(nextQuestion);

    optionRadios.change(onOptionSelected);

    startTest();

    function startTest() {
	shuffle(questions);
	$('.num-questions').html(questions.length);
	setCurrentQuestionIndex(0);
	showCurrentQuestion();
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
	return questions[getCurrentQuestionIndex()].data;
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
