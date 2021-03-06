import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, Link } from 'react-router-dom';
// import Carousel from 'react-elastic-carousel';
import copy from 'clipboard-copy';
import Button from '@material-ui/core/Button';
import shareIcon from '../images/shareIcon.svg';
import bHIcon from '../images/blackHeartIcon.svg';
import wHIcon from '../images/whiteHeartIcon.svg';
import RecomendedCard from '../components/RecomendedCard';
import '../styles/Details.css';

function FoodDetails({ match: { params: { id } } }) {
  const [food, setFood] = useState({});
  const [recomendedDrink, setRecomendedDrink] = useState([]);
  const {
    strMealThumb,
    strMeal,
    strCategory,
    strInstructions,
    strYoutube,
    strArea,
  } = food;
  const [ingredientList, setIngredientList] = useState([]);
  const location = useLocation();
  const [share, setShare] = useState(false);
  const [visible, setVisible] = useState([false, false, true, true, true, true]);
  const [doneRecipe, setDoneRecipe] = useState(false);
  const [continueRecipe, setContinueRecipe] = useState('Iniciar Receita');
  const [favorite, setFavorite] = useState(false);
  const [favoriteIcon, setFavoriteIcon] = useState(wHIcon);

  const fetchRecomendedDrink = async () => {
    const endPointRecomendedDrink = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
    const request = await fetch(endPointRecomendedDrink);
    const response = await request.json();
    setRecomendedDrink(response.drinks);
  };

  // const renderRecomendedDrink = () => {
  //   const SEIS = 6;
  //   const sliceRecomended = recomendedDrink.slice(0, SEIS);
  //   if (sliceRecomended.length > 0) {
  //     return (
  //       <Carousel data-testid="recomendation-card" itemsToShow={ 2 } itemsToScroll={ 2 }>
  //         {sliceRecomended.map((drink, index) => (
  //           <Link key={ drink.idDrink } to={ `/comidas/${drink.idDrink}` }>
  //             <RecomendedCard
  //               title={ drink.strDrink }
  //               id={ drink.idDrink }
  //               index={ index }
  //               img={ drink.strDrinkThumb }
  //             />
  //           </Link>
  //         ))}
  //       </Carousel>
  //     );
  //   }
  // };

  useEffect(() => {
    const fetchFoodById = async () => {
      const endPointFoodById = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
      const request = await fetch(endPointFoodById);
      const response = await request.json();
      setFood(response.meals[0]);
    };
    fetchFoodById();
    fetchRecomendedDrink();
    setVisible([false, false, true, true, true, true]);
  }, [id]);

  useEffect(() => {
    const ingredientsArray = [];
    const maxIngredients = 20;
    for (let index = 0; index < maxIngredients; index += 1) {
      const ingredient = food[`strIngredient${index}`];
      const measure = food[`strMeasure${index}`];
      if (ingredient) {
        ingredientsArray.push({
          ingredient,
          measure,
        });
      }
    }
    setIngredientList(ingredientsArray);
  }, [food]);

  useEffect(() => {
    const doneRecipes = JSON.parse(localStorage.getItem('doneRecipes'));
    if (doneRecipes && doneRecipes.some((recipe) => recipe.id === id)) {
      setDoneRecipe(true);
    }
    const inProgressRecipes = JSON.parse(localStorage.getItem('inProgressRecipes'));
    if (inProgressRecipes && inProgressRecipes.meals[id]) {
      setContinueRecipe('Continuar Receita');
    }
    const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes'));
    if (favoriteRecipes) {
      const isFavorite = favoriteRecipes.some((fav) => fav.id === id);
      if (isFavorite) {
        setFavorite(true);
      }
    }
  },
  [food, id]);

  const saveFavoriteRecipes = () => {
    const favoriteObject = [{
      id,
      type: 'comida',
      area: strArea,
      category: strCategory,
      alcoholicOrNot: '',
      name: strMeal,
      image: strMealThumb,
    }];
    const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes'));
    if (!favoriteRecipes) {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteObject));
    } else {
      const updateFavorite = [...favoriteRecipes, ...favoriteObject];
      localStorage.setItem('favoriteRecipes', JSON.stringify(updateFavorite));
    }
  };

  const deleteFavoriteRecipes = () => {
    const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes'));
    const updateFavorite = favoriteRecipes.filter((rec) => rec.id !== id);
    if (updateFavorite.length === 0) {
      localStorage.removeItem('favoriteRecipes');
    } else {
      localStorage.setItem('favoriteRecipes', JSON.stringify(updateFavorite));
    }
  };

  const handleFavorite = () => {
    if (favorite) {
      deleteFavoriteRecipes();
    } else {
      saveFavoriteRecipes();
    }
    setFavorite(!favorite);
  };

  useEffect(() => {
    if (favorite) {
      setFavoriteIcon(bHIcon);
    } else {
      setFavoriteIcon(wHIcon);
    }
  }, [favorite]);
  return (
    <div>
      <Link to="/bebidas">
        <img
          src="https://img.icons8.com/ios-glyphs/90/000000/circled-left.png"
          alt="back"
          className="back-btn"
        />
      </Link>
      <div>
        <img
          className="details-img"
          data-testid="recipe-photo"
          src={ strMealThumb }
          alt={ food }
        />
      </div>
      <div className="content-container">
        <div className="title-container">
          <h2 data-testid="recipe-title">{ strMeal }</h2>
          <div className="btn-container">
            <Button
              onClick={ () => {
                copy(`http://localhost:3000${location.pathname}`);
                setShare(true);
              } }
              type="button"
            >
              <img src={ shareIcon } alt="imagem de compartilhar" data-testid="share-btn" />
            </Button>
            { share && <p>Link copiado!</p> }
            <Button
              type="button"
              onClick={ handleFavorite }
            >
              <img data-testid="favorite-btn" src={ favoriteIcon } alt="favorite" />
            </Button>
          </div>
        </div>
        <p data-testid="recipe-category">{ strCategory }</p>
        <p>Ingredientes:</p>
        <ul className="ingredient-list">
          {ingredientList.map((ingredient, index) => (
            <li
              key={ index }
              data-testid={ `${index}-ingredient-name-and-measure` }
            >
              { `${ingredient.ingredient} - ${ingredient.measure}` }
            </li>))}
        </ul>
        <p data-testid="instructions">{ strInstructions }</p>
        {strYoutube && <iframe
          title={ strMeal }
          src={ `https://www.youtube.com/embed/${strYoutube.split('=')[1]}` }
          data-testid="video"
          width="300"
          height="200"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />}
        <h3>Drinks recomendados</h3>
        {/* {renderRecomendedDrink()} */}
        <Link to={ `/comidas/${id}/in-progress` }>
          <button
            className="recipe-btn"
            variant="contained"
            color="primary"
            type="button"
            data-testid="start-recipe-btn"
            hidden={ doneRecipe }
          >
            {continueRecipe}

          </button>
        </Link>
      </div>
    </div>
  );
}

FoodDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default FoodDetails;

// referencia tag iframe para video: https://www.w3schools.com/html/html_youtube.asp
