import * as modal from './modal.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search resul
    resultsView.update(modal.getSearchResultsPage());

    //3) Updating bookmarks view
    bookmarksView.update(modal.state.bookmarks);

    ///1. Loading recipe
    ///Async function will return promise thus we need t handle that with await
    await modal.loadRecipe(id);

    // 2) Rendering recipe

    recipeView.render(modal.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function (defaultPage = 1) {
  try {
    resultsView.renderSpinner();
    //1) get search query
    const query = searchView.getQuery();
    // if (!query) return;

    //2) Load search results
    await modal.loadSearchResults(query);

    // 3)render results

    // resultsView.render(modal.state.search.results);
    resultsView.render(modal.getSearchResultsPage(defaultPage));

    //4)Render initial pagination buttons
    paginationView.render(modal.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (goToPage) {
  //1) Render NEW results
  resultsView.render(modal.getSearchResultsPage(goToPage));

  //2) render new pagination button
  paginationView.render(modal.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  modal.updateServings(newServings);
  //Update  the recipe view
  // recipeView.render(modal.state.recipe);
  recipeView.update(modal.state.recipe);
};

const controlAddBookmark = function () {
  //1) Add or remove bookmarks
  if (!modal.state.recipe.bookmarked) modal.addBookmark(modal.state.recipe);
  else modal.deleteBookmark(modal.state.recipe.id);

  //2) Update recipe view
  recipeView.update(modal.state.recipe);

  // 3)Render bookmarks
  bookmarksView.render(modal.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(modal.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();
    await modal.uploadRecipe(newRecipe);
    console.log(modal.state.recipe);

    //Render recipe

    recipeView.render(modal.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(modal.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null, '', `#${modal.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🎈🎈', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerRenderUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

console.log(welcome);

// window.addEventListener('hashchange', showRecipe);
// window.addEventListener('load', showRecipe);
