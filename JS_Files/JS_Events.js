
                // *** DECLARED VARIABLES *** //
                // *** __________________ *** //

let numRank;
let allButtons        = document.querySelectorAll('.button')
const removeButtons   = document.querySelectorAll('.remove-comment')
const enterID         = document.getElementById('enter-id')
const topTen          = document.getElementById('top-ten')
const albumSearch     = document.getElementById('album-form');
const artistSearch    = document.getElementById('artist-form');
const suggestionForm  = document.getElementById('suggestion');
const commentBox      = document.getElementById('comment-box');

let url = (searchTerm, type) => {
  return `https://itunes.apple.com/search?term=${searchTerm}&entity=album&attribute=${type}Term`
}


                // *** EVENT LISTENERS *** //
                // *** _______________ *** //


    // *** TOGGLE BUTTON COLORS *** //
allButtons.forEach(button => button.addEventListener('mouseover', event => {
  event.target.style.color = 'orange'
}))

allButtons.forEach(button => button.addEventListener('mouseout', event => {
  event.target.style.color = 'white'
}))

removeButtons.forEach(button => button.addEventListener('mouseover', event => {
  event.target.style.color = 'white'
  event.target.style.backgroundColor = "black"
}))

removeButtons.forEach(button => button.addEventListener('mouseout', event => {
  event.target.style.color = 'black'
  event.target.style.backgroundColor = 'white'
}))


    // *** ADD USERNAME TO HEADER AND SUGGESTION BOX *** //
enterID.addEventListener('submit', (event) => {
  event.preventDefault();
  userName = event.target.user_id.value;
  document.getElementById('userName-topten').innerText = 
  `${userName}'s Top Ten Albums`;
  document.getElementById('comment-box-header').innerText = `Suggestions for ${userName}:`;
  enterID.reset();
  fetchUserData();
})


    // *** SEARCH ITUNES API WITH ALBUM PARAMETERS *** //
albumSearch.addEventListener('submit', (event) => {
  event.preventDefault();
  searchDisplay.innerHTML = "";
  let albumsArray = [];
  return fetch(url(event.target.album_terms.value, 'album'), {method: 'GET'})
  .then(res => res.json())
  .then(function (albumData) {
    albumsArray = albumData.results;
    albumsArray.forEach(album => renderAlbum(album));
    albumSearch.reset();
    artistSearch.reset();
    console.log('end of album search event')
  })
})


    // *** SEARCH ITUNES API WITH ARTIST PARAMETERS *** //      
artistSearch.addEventListener('submit', (event) => {
  event.preventDefault();
  searchDisplay.innerHTML = "";
  let albumsArray = [];
  return fetch(url(event.target.artist_terms.value, 'artist'), {method: 'GET'})
  .then(res => res.json())
  .then(function (albumData) {
    albumsArray = albumData.results;
    albumsArray.forEach(album => renderAlbum(album));
    artistSearch.reset();
    albumSearch.reset();
  })
})
        

    // *** DISPLAY COMMENT BOX AFTER CLICK ON '+ COMMENT' BUTTON *** //
topTen.addEventListener('click', (event) => {
  if (userName === "") {alert('Please enter/create your userName.'); return;}
  if (event.target.className === 'button' && event.target.value !== "SUBMIT") {
    numRank = parseInt(event.target.id.slice(15))
    displayCommentForm(numRank)
    document.getElementById(`reason-${numRank}`).addEventListener('submit', (e) => {
      e.preventDefault();
      albumComment = e.currentTarget.reason.value
      if (countWords(albumComment) !== 10) {
        alert("That's not 10 words!")
      } else {
        document.getElementById(`comment-display-${numRank}`).textContent = albumComment
        displayComment(numRank)
        let commentObject = createCommentObject (numRank, albumComment)
        createNewCommentsObject(numRank, commentObject)
        patchUserInfo(commentPatch)
      }
    })
  }
})


    // *** REMOVE COMMENT FROM DB AND UPDATE PAGE *** //
topTen.addEventListener('click', event => {
  if (event.target.className === 'remove-comment') {
    numRank = parseInt(event.target.id.slice(15))
    albumComment = ""
    document.getElementById(`comment-display-${numRank}`).textContent = albumComment
    displayCommentButton(numRank)
    let commentObject = createCommentObject (numRank, albumComment)
    createNewCommentsObject(numRank, commentObject)
    patchUserInfo(commentPatch)
  }
})


    // *** ADD SUGGESTION TO THE SUGGESTION BOX *** //
suggestionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  let nameSuggestion = event.target.name_suggestion.value;
  let albumLoved = event.target.album_loved.value;
  let albumSuggestion = event.target.album_suggestion.value;
  let artistSuggestion = event.target.artist_suggestion.value;
  let otherUserCommentBox = document.createElement('p');
  otherUserCommentBox.textContent =
  `${nameSuggestion} loves "${albumLoved}", too, and suggests you check out "${albumSuggestion}" by ${artistSuggestion}!`;
  let suggestionObject = {albumSuggestions: otherUserCommentBox.textContent}
    createNewSuggestionsObject(suggestionObject)
    patchUserInfo(suggestionPatch)
    fetchUserData()
  suggestionForm.reset()
})

// google dataset.html event.target.dataset.id