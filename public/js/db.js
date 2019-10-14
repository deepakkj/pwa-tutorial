// offline data
db.enablePersistence()
.then((e) => console.log('offline data', e))
.catch(err => {
    if(err.code === 'failed-precondition') {
        // multiple tabs open
        console.log('precondition failed');
    }
    if(err.code === 'unimplemented') {
        // lack of browser support
        console.log('persistance is not available');
    }
});


// realtime listener
db.collection('recipes').onSnapshot((snapshot) => {
    // console.log(snapshot.docChanges());
    snapshot.docChanges().forEach(change => {
        console.log(change, change.doc.data(), change.doc.id);
        if(change.type === 'added') {
            // add the document data to the ui
            renderRecipe(change.doc.data(), change.doc.id);
        }
        if(change.type === 'removed') {
            // remove the document data from the ui
            removeRecipe(change.doc.id);
        }
    });
});

//  add new recipe form
const form = document.querySelector('#newRecipeForm');
form.addEventListener('submit', event => {
    event.preventDefault();
    const recipe = {
        title: form.title.value,
        ingredients: form.ingredients.value
    };
    // save data to firestore DB
    db.collection('recipes').add(recipe)
    .then((e) => console.log('successfully added a new recpie to DB', e))
    .catch(e => console.error('unable to add a new recipe to DB', e));
    //reset form fields
    form.title.value = '';
    form.ingredients.value = '';
});

//delete recipe from firestore DB
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', event => {
    if(event.target.tagName === 'I') {
        const id = event.target.getAttribute('data-id');
        // call firestore to delete the recipe
        db.collection('recipes').doc(id).delete();
    }
});
