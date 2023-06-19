const state = {
	list: [],
	current: 0,
};

const ids = {
	question: 'question',
	song: 'song',
	songTemplate: 'song-template',
	answer: 'answer',
	answerTemplate: 'answer-template',
	showAnswer: 'show-answer',
	nextQuestion: 'next-question',
};

const classes = {
	song: '.song',
	songLines: '.song-lines',
	songNext: '.song-next',
	answer: '.answer',
	answerName: '.answer-name',
	answerSinger: '.answer-singer',
	answerAlbum: '.answer-album',
	answerYear: '.answer-year',
	answerMedia: '.answer-media',
};

function random(max) {
	return Math.floor(Math.random() * max);
}

function renderLine(text) {
	const $line = document.createElement('div');
	$line.innerHTML = text;
	return $line;
}

function getSongs(count) {
	return fetch(
		`https://furrycat.ru/russian-rock/api/random-song.php?count=${count}`
	).then((res) => res.json());
}

function* linesIterator(lines, startIndex) {
	let currentIndex = startIndex;
	while (currentIndex < lines.length) {
		yield lines[currentIndex];
		currentIndex++;
	}
}

function renderSong(iterator) {
	const template = document.getElementById(ids.songTemplate);
	const $song = template.content.cloneNode(true);
	const $lines = $song.querySelector(classes.songLines);
	const $next = $song.querySelector(classes.songNext);

	const result = iterator.next();
	const $line = renderLine(result.value);
	$lines.appendChild($line);

	$next.addEventListener('click', () => {
		const result = iterator.next();
		if (result.done) {
			$next.disabled = true;
		} else {
			const $line = renderLine(result.value);
			$lines.appendChild($line);
		}
	});

	return $song;
}

function initQuestion() {
	const $songContainer = document.getElementById(ids.song);

	const song = state.list[state.current];

	const lines = song.text.split('\r\n').filter((line) => line.trim().length);
	const lineIndex = random(lines.length);
	const iterator = linesIterator(lines, lineIndex);

	const $song = renderSong(iterator);

	$songContainer.innerHTML = '';
	$songContainer.appendChild($song);
}

function renderAnswer(song) {
	const template = document.getElementById(ids.answerTemplate);
	const $answer = template.content.cloneNode(true);
	$answer.querySelector(classes.answerName).innerHTML = song.name;
	$answer.querySelector(classes.answerSinger).innerHTML = song.singer.name;
	$answer.querySelector(classes.answerAlbum).innerHTML = song.album.name;
	$answer.querySelector(classes.answerYear).innerHTML = song.album.year;
	const $frame = $answer.querySelector(classes.answerMedia);
	if (song.url) {
		$frame.src = song.url;
		$frame.hidden = false;
	} else {
		$frame.hidden = true;
	}

	return $answer;
}

function showAnswer() {
	const song = state.list[state.current];
	const $answerContainer = document.getElementById(ids.answer);
	const $answer = renderAnswer(song);
	$answerContainer.innerHTML = '';
	$answerContainer.appendChild($answer);
  document.getElementById(ids.showAnswer).disabled = true;
}

function nextQuestion() {
  document.getElementById(ids.showAnswer).disabled = false;
	const $answerContainer = document.getElementById(ids.answer);
	$answerContainer.innerHTML = '';
	state.current++;
	initQuestion();
}

function init() {
	getSongs(20).then((songs) => {
		state.list = songs;
		initQuestion();

		$showAnswer = document.getElementById(ids.showAnswer);
		$nextQuestion = document.getElementById(ids.nextQuestion);

		$showAnswer.addEventListener('click', showAnswer);
		$nextQuestion.addEventListener('click', nextQuestion);
	});
}

init();
