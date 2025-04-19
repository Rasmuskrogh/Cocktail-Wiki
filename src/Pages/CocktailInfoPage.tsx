import { useContext, useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Heart from "../assets/heart.svg";
import HeartFilled from "../assets/heart-fill.svg";
import "./css/CocktailInfoPage.css";
import { FavoritesContext } from "../Context/FavoritesContext";
import SkeletonInfo from "../Skeletons/SkeletonInfo";
import { IDrinkInfo } from "../interfaces";
import Button from "../Components/Button";

function CocktailInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favoriteDrinks, setFavoriteDrinks } = useContext(FavoritesContext);
  const [activeDrink, setActiveDrink] = useState<IDrinkInfo>({
    name: "",
    id: 0,
    image: "",
    category: "",
    tags: [],
    ingredients: [],
    measures: [],
    glass: "",
    instructions: [],
  });
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const checkIfInFavorites = useCallback(() => {
    if (favoriteDrinks && activeDrink.id !== 0) {
      setIsFavorite(
        favoriteDrinks.some((drink) => drink.id === activeDrink.id)
      );
    }
  }, [favoriteDrinks, activeDrink.id]);

  useEffect(() => {
    checkIfInFavorites();
  }, [checkIfInFavorites]);

  // function to copy cocktail link to clipboard
  const shareCocktailLink = () => {
    const cocktailUrl = window.location.href;
    navigator.clipboard.writeText(cocktailUrl);
    setLinkCopied(true);
  };

  // Adds or removes drink to favorite
  useEffect(() => {
    if (favoriteDrinks && setFavoriteDrinks && activeDrink.id !== 0) {
      const favorites = [...favoriteDrinks];
      if (isFavorite) {
        favorites.push({
          name: activeDrink.name,
          id: activeDrink.id,
          image: activeDrink.image,
        });
        setFavoriteDrinks(favorites);
      } else {
        const newFavorites = favorites.filter(
          (favorite) => favorite.id !== activeDrink.id
        );
        setFavoriteDrinks(newFavorites);
      }
    }
  }, [isFavorite]);

  // fetch drink from API through id
  useEffect(() => {
    const getDrinkById = async () => {
      try {
        const response = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const data = await response.json();

        // if a drink is not found then it redirects to notfoundpage
        if (!data.drinks || data.drinks.length === 0) {
          navigate("/not-found");
          return;
        }

        // change title in browser to reflect current page
        document.title = `Cocktail Wiki - ${data.drinks[0].strDrink}`;

        // format data
        let tags;
        if (data.drinks[0].strTags) {
          tags = data.drinks[0].strTags.split(",");
        }
        const instructions = data.drinks[0].strInstructions.split(". ");
        const measuresArr: string[] = [];
        const ingredientsArr: string[] = [];

        for (let i = 1; data.drinks[0]["strMeasure" + i]; i++) {
          const measureItem: string = data.drinks[0]["strMeasure" + i];
          measuresArr.push(measureItem);
        }
        for (let i = 1; data.drinks[0]["strIngredient" + i]; i++) {
          const ingredientItem: string = data.drinks[0]["strIngredient" + i];
          ingredientsArr.push(ingredientItem);
        }

        // set fetched data to activeDrink
        setActiveDrink({
          name: data.drinks[0].strDrink,
          id: data.drinks[0].idDrink,
          image: data.drinks[0].strDrinkThumb,
          category: data.drinks[0].strCategory,
          tags: tags,
          ingredients: ingredientsArr,
          measures: measuresArr,
          glass: data.drinks[0].strGlass,
          instructions: instructions,
        });
      } catch (error) {
        //this is when there is an error while getting the data from the api so that it prints the error in the console but through navigate it redirects to notfound page
        console.error("Error fetching drink data:", error);
        navigate("/not-found");
      }
    };

    getDrinkById();
  }, [id, navigate]);

  return (
    <section className="drink-info">
      {activeDrink.name ? (
        <div>
          <section className="image-wrapper">
            <figure className="image">
              <img src={activeDrink.image} alt={activeDrink.name} />
            </figure>
            <div className="header-icon-container">
              <h1>{activeDrink.name}</h1>
              <figure
                className="icon"
                onClick={() => setIsFavorite((prev) => !prev)}
              >
                <img src={isFavorite ? HeartFilled : Heart} alt="" />
              </figure>
            </div>
            <h3>{activeDrink.category}</h3>
          </section>
          <section className="ingredients">
            <h2>Ingredients</h2>
            <div className="ingredients-content">
              <div>
                {activeDrink.measures.map((measure: string, i) => (
                  <p key={i}>{measure}</p>
                ))}
              </div>
              <div>
                {activeDrink.ingredients.map((ingredient: string, i) => (
                  <Link key={i} to={`/ingredient/${ingredient}`}>
                    <p>{ingredient}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          <section className="instructions">
            <h2>Instructions</h2>
            <div className="instructions-text">
              {activeDrink.instructions.map((instruction: string, i) => (
                <p key={i}>{instruction}</p>
              ))}
            </div>
            <p className="glass-info">Best served in a {activeDrink.glass}</p>

            {activeDrink.tags ? (
              <div className="tags">
                <p>Tags:</p>
                {activeDrink.tags.map((tag: string, i) => (
                  <p key={i}>{tag}</p>
                ))}
              </div>
            ) : (
              ""
            )}

            <Button
              label={linkCopied ? "Link copied!" : "Share Cocktail"}
              onClick={shareCocktailLink}
              className="share-button"
            ></Button>
          </section>
        </div>
      ) : (
        // show skeleton placeholder before drink is loaded
        <SkeletonInfo />
      )}
    </section>
  );
}

export default CocktailInfoPage;
