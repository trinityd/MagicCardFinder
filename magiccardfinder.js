// API search URL:
// https://api.magicthegathering.io/v1/cards?name=%22${name}%22

let cards = [];

function searchCards() 
{
	let name = $('#input').val();
	let apiCall = `https://api.magicthegathering.io/v1/cards?name=${name}`;

	let ajax = new XMLHttpRequest();
	ajax.onload = gotResponse;
	ajax.onerror = function(err) { console.log(err); }
	ajax.open('GET', apiCall, true);
	// ajax.setRequestHeader('X-Mashape-Key', prodKey);
	ajax.send();
}

function imageExists(image_url)
{
    let http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    try {
    	http.send();
    } catch(error) {
    	return false;
    }

    return http.status != 404;
}

function gotResponse(progressEvent) 
{
	let results = $('#results');
	results.empty();

	let response = JSON.parse(progressEvent.currentTarget.response);
	cards = response.cards;

	if(cards.length == 0)
	{
		results.text('No results.');
	}
	else
	{
		cards.sort(sortCards);
		console.log(cards)
	
		printCards();
	}
}

function sortCards(a, b)
{
	let by = $('#sort option:selected').attr('name');
	let order = 'asc';
	if($('#order').html() == 'Descending') order = 'desc';

	if(by == 'name')
	{
		if(order == 'asc') return a.name.localeCompare(b.name);
		else return b.name.localeCompare(a.name);
	}
	else if(by == 'cost')
	{
		let c1 = a.cmc;
		let c2 = b.cmc;
		if(c1 == undefined) c1 = 0;
		if(c2 == undefined) c1 = 0;

		if(order == 'asc') return c1 - c2;
		else return c2 - c1;
	}
}

function printCards() {
	for(let card of cards)
	{
		console.log(card)
		if(card.imageUrl != undefined && imageExists(card.imageUrl))
		{
			let name = card.name;
			let cardLink = $('<a></a>');
			cardLink.attr('href', `http://gatherer.wizards.com/Pages/Search/Default.aspx?name=+[${name}]`);
			cardLink.on('click', function() {
				chrome.tabs.create({url: $(this).attr('href')});
			});

			let newCard = $('<div></div>');
			newCard.addClass('card');

			let cardImg = $('<img></img>');
			cardImg.addClass('cardimg');
			cardImg.attr('src', card.imageUrl);
			newCard.append(cardImg);
			cardLink.append(newCard);

			$('#results').append(cardLink);
		}
	}
}

$('#search').click(searchCards);

$('#order').click(function() {
	if($(this).html() == 'Ascending')
	{
		$(this).html('Descending');
	}
	else $(this).html('Ascending');

	if(cards.length != 0) {
		cards.sort(sortCards);
		$('#results').empty();
		printCards();
	}
});

$(document).keypress(function(e) {
    if(e.which == 13)
    {
    	searchCards();
    }
});