
                // *** DECLARED VARIABLES *** //
                // *** __________________ *** //

let userID;    
let userNameObject;
let fullUserObject; 
let firstHalfPatchComments  = [];
let secondHalfPatchComments = [];
let commentPatch      = [];
let firstHalfPatch    = [];
let secondHalfPatch   = [];
let albumPatch        = [];
let suggestionPatch   = []; 
let userName          = "";
let albumRank         = "";
let albumComment      = "";
let nameSuggestion    = "";
let albumLoved        = "";
let albumSuggestion   = "";
let artistSuggestion  = "";
const searchDisplay   = document.getElementById('album-search-display');


                // *** FETCH REQUESTS *** //
                // *** ______________ *** //


    // *** LOAD USER TOP TEN WHEN USERNAME IS ENTERED *** //
    // *** CALLED IN enterId SUBMIT EVENT LISTENER    *** //
function fetchUserData () {
  return fetch(`http://localhost:3000/userCollections`, {method: 'GET'})
  .then(res => res.json())
  .then(function (userData) {
    let foundUser = userData.find((user) => {
      currentUser = {...user}
      return userName === user.userName
    })
    if (foundUser) {
      userID = foundUser.id;
      fullUserObject = {...currentUser}
      albumsDataArray = fullUserObject.albums
      for (let i = 0; i <foundUser.albums.length; i++) {
        changeTopTenInfo(foundUser, i)
      }
      commentsDataArray = fullUserObject.albumComments
      for (let i = 0; i <foundUser.albumComments.length; i++) {
        changeCommentsInfo(foundUser, i)
      }
      suggestionsDataArray = fullUserObject.albumSuggestions
      removeAllChildNodes (commentBox)
      for (let i = 0; i <foundUser.albumSuggestions.length; i++) {
        changeSuggestionInfo(foundUser, i)
      }
    } else {
      userNameObject = {userName: `${userName}`, albumSuggestions: []}
      fullUserObject = {...userNameObject, ...userAlbumsObject, ...userCommentsObject}
      albumsDataArray = fullUserObject.albums
      createUserData(fullUserObject)
      fetchUserData()
    }
  })
}

    // *** CREATE NEW USER AND ID IN DATABASE *** //
    // *** CALLED IN fetchUserData, WHICH IS CALLED IN enterID LISTENER *** //
function createUserData (userObject) {
  fetch('http://localhost:3000/userCollections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body:JSON.stringify(userObject)
  })
  .then(res => res.json())
  .then(user => {
    userID = user.id;
  })
}


function patchUserInfo (object) {
  fetch(`http://localhost:3000/userCollections/${userID}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body:JSON.stringify(object)
  })
  .then(res => res.json())
  .then(object => console.log(object))
}


              // *** FUNCTION DECLARATIONS *** //
              // *** _____________________ *** //


    // *** RENDER INFO OF EACH ALBUM FROM DB *** //
    // *** CALLED IN fetchUserData *** //
function changeTopTenInfo (user, i) {
  document.getElementById(`para-${i+1}`).innerHTML = ""
  document.getElementById(`para-${i+1}`).innerHTML = `artist: ${user.albums[i].artistName}<br>
  album: ${user.albums[i].collectionName}<br>
  genre: ${user.albums[i].primaryGenreName}<br>
  year: ${user.albums[i].releaseDate}`;
  document.getElementById(`cover-${i+1}`).innerHTML = `
  <img class='placed-cover' src=${user.albums[i].artworkUrl100} height="100" width="100"><br>
  <button type="button" class='button2' id='remove-${i+1}>X</button>`;
}


    // *** DISPLAY COMMENT FROM DB IF IT EXISTS *** //
    // *** CALLED IN fetchUserData *** //
function changeCommentsInfo (user, i) {
  if (user.albumComments[i].comment === "") {
    displayCommentButton(i+1)
    return;
  } else {
    document.getElementById(`comment-display-${i+1}`).textContent = user.albumComments[i].comment
    displayComment(i+1)
  }
}


    // *** DISPLAY EACH SUGGESTION FROM DB *** //
    // *** CALLED IN fetchUserData *** //
function changeSuggestionInfo (user, i) {
  let suggestedAlbum = document.createElement('li')
  suggestedAlbum.innerText = user.albumSuggestions[i].albumSuggestions
  commentBox.appendChild(suggestedAlbum)
}


    // *** CLEAR SUGGESTION BOX DISPLAY *** //
    // *** CALLED IN fetchUserData *** //
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}


    // *** SWITCH FROM COMMENT BUTTON TO FORM OR COMMENT DISPLAY *** //
    // *** CALLED IN topTen EVENT LISTENER *** //
function displayCommentButton (number) {
  document.getElementById(`reason-${number}`).style.display = 'none'
  document.getElementById(`comment-button-${number}`).style.display = 'inline-block'
  document.getElementById(`comment-display-${number}`).style.display = 'none'
  document.getElementById(`remove-comment-${number}`).style.display = 'none'
}


function displayCommentForm (number) {
  document.getElementById(`reason-${number}`).style.display = 'inline-block'
  document.getElementById(`comment-button-${number}`).style.display = 'none'
  document.getElementById(`comment-display-${number}`).style.display = 'none'
  document.getElementById(`remove-comment-${number}`).style.display = 'none'
}


function displayComment (number) {
  document.getElementById(`reason-${number}`).style.display = 'none'
  document.getElementById(`comment-button-${number}`).style.display = 'none'
  document.getElementById(`comment-display-${number}`).style.display = 'inline-block'
  document.getElementById(`remove-comment-${number}`).style.display = 'inline-block'
}
        

    // *** CREATE AN ALBUM IN THE SEARCH DISPLAY BOX *** //
    // *** CALLED IN artistSearch OR albumSearch SUBMIT EVENT LISTENER *** //
function renderAlbum (album) {
  let albumInfo = document.createElement('div')
  createAlbumInfoDiv(albumInfo, 'album-render-div', album)
  searchDisplay.appendChild(albumInfo);   
  albumInfo.addEventListener('click', () => {
    let checkExist = !!document.getElementById('number-form');
    if (checkExist === false) {
      let numForm = document.createElement('form')
      createNumberForm(numForm, albumInfo)
      numForm.addEventListener ('submit', (e) => {
        e.preventDefault();
        searchDisplay.innerHTML = "";
        albumRank = parseInt(e.target.number_control.value);
        let albumObject = createAlbumObject (albumRank, album)
        if (userName === "") {alert('Please enter/create your userName.'); return;}
        if (albumRank == parseInt(document.getElementById(`match-ranking-${albumRank}`).innerText)) {
          addToTopTen (albumRank, album);
          createNewAlbumsObject(albumObject);
          patchUserInfo (albumPatch);
          fetchUserData();
        }
      })
    }
  })
}


    // *** CREATE DIV FOR ALBUM IN SEARCH DISPLAY *** //
    // *** CALLED IN renderAlbum *** //
function createAlbumInfoDiv (div, string, object) {
  div.className = string;
  div.innerHTML = `
    <img style='padding-top: 10px' src="${object.artworkUrl100}" width="75" height="75">
    <p class='icon'>${object.artistName}<br>
    ${object.collectionName}</p>
    `;
}


    // *** CREATE AND APPEND NUMBER TO ALBUM IN SEARCH RESULTS *** //
    // *** CALLED IN renderAlbum *** //
function createNumberForm (form, div) {
  form.setAttribute('id', 'number-form');
  let numInputForm = document.createElement('input');
  numInputForm.setAttribute('type', 'number');
  numInputForm.setAttribute('min', '1');
  numInputForm.setAttribute('max', '10');
  numInputForm.setAttribute('id', 'number_control');
  numInputForm.setAttribute('name', 'number-ctrl');
  form.appendChild(numInputForm);
  let cancelAdd = document.createElement('BUTTON');
  cancelAdd.textContent = 'X';
  form.appendChild(cancelAdd);
  let submitNumber = document.createElement('input');
  submitNumber.setAttribute('type', 'submit');
  submitNumber.setAttribute('value', 'TOP TEN!');
  submitNumber.setAttribute('class', 'button');
  form.appendChild(submitNumber);
  div.appendChild(form);
}


    // *** INFO TO BE PATCHED INTO DB *** //
    // *** CALLED IN renderAlbum *** //
function createAlbumObject (number, object) {
  let albumObject = {
    ranking: number,
    artistName: object.artistName,
    collectionName: object.collectionName,
    primaryGenreName: object.primaryGenreName,
    releaseDate: object.releaseDate.slice(0, 4),
    artworkUrl100: object.artworkUrl100
  };
  return albumObject;
}


    // *** INFO TO DISPLAY FOR EACH ALBUM IN DB *** //
    // *** CALLED IN renderAlbum *** //
function addToTopTen (number, object) {
  document.getElementById(`para-${number}`).innerHTML = `
  artist: ${object.artistName}<br>
  album: ${object.collectionName}<br>
  genre: ${object.primaryGenreName}<br>
  year: ${object.releaseDate.slice(0, 4)}`;
  document.getElementById(`cover-${number}`).innerHTML = 
  `<img class='placed-cover' src=${object.artworkUrl100} height="100" width="100">`
  window.location.hash = `album-${number}`;
}


    // *** INFO TO BE PATCHED INTO DB *** //
    // *** CALLED IN topTen EVENT LISTENER
function createCommentObject (number, string){
  let commentObject = {
    ranking: number,
    comment: string
  }
  return commentObject
}


    // *** INFO TO BE PATCHED INTO DB *** //
    // *** CALLED IN suggestionForm EVENT LISTENER *** //
function createSuggestionObject (string) {
  let suggestionObject = {
    albumSuggestions: string
  }
  return suggestionObject
}


    // *** INSERT OBJECT INTO ARRAY BASED ON ALBUM RANK *** //
    // *** CALLED IN renderAlbum *** //
function createNewAlbumsObject (object) {
  firstHalfPatch = albumsDataArray.slice(0, albumRank-1)
  secondHalfPatch = albumsDataArray.slice(albumRank)
  let newAlbumArray = [...firstHalfPatch, object, ...secondHalfPatch]
  albumPatch = {'albums': newAlbumArray}
  return albumPatch
}


    // *** INSERT OBJECT INTO ARRAY BASED ON ALBUM RANK *** //
    // *** CALLED IN topTen EVENT LISTENER *** //
function createNewCommentsObject (number, object) {
  firstHalfPatchComments = commentsDataArray.slice(0, number-1)
  secondHalfPatchComments = commentsDataArray.slice(number)
  let newCommentArray =[...firstHalfPatchComments, object, ...secondHalfPatchComments]
  commentPatch = {'albumComments': newCommentArray}
  return commentPatch
}


    // *** INSERT OBJECT AT END OF ARRAY *** //
    // *** CALLED IN suggestionForm EVENT LISTENER *** //
function createNewSuggestionsObject (object) {
  let newSuggestionArray = [...suggestionsDataArray, object]
  suggestionPatch = {'albumSuggestions': newSuggestionArray}
  return suggestionPatch
}


    // *** VERIFY THAT USER COMMENT IS EQUAL TO TEN WORDS *** //
    // *** CALLED IN topTen EVENT LISTENER *** //
function countWords (userComment) {
  let count = 0;
  for (let i = 0; i < userComment.length; i++){
     const space = userComment[i];
     if(space !== ' '){
        continue; };
        count++; };
     return count + 1;
};