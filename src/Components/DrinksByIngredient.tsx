import { useEffect, useState } from "react";
import { IDrink } from "../interfaces";
import DrinkCard from "../Components/DrinkCard";
import "./css/DrinksByIngredient.css";

interface IDrinksbyIngredient {
  name: string;
}

function DrinksByIngredient({ name }: IDrinksbyIngredient) {
  const [listOfDrinks, setListOfDrinks] = useState<IDrink[]>([]);
  const [drinkBatch, setDrinkBatch] = useState<number>(1);
  const drinksPerBatch = 10;
  const lastDrink = drinkBatch * drinksPerBatch;
  const currentDrinks = listOfDrinks.slice(0, lastDrink);

  // Keeps track of how much the user has scrolled on the page
  const handleScroll = () => {
    // updates infinite scroll list of related drinks
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (listOfDrinks.length / drinksPerBatch > drinkBatch) {
        setDrinkBatch((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    // fetch list of drinks that includes the ingredient
    const getDrinksByIngredient = async () => {
      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${name}`
      );
      const data = await response.json();

      if (data.drinks !== null) {
        setListOfDrinks(
          data.drinks.map(
            (drink: {
              strDrink: string;
              idDrink: string;
              strDrinkThumb: string;
            }) => ({
              name: drink.strDrink,
              id: drink.idDrink,
              image: drink.strDrinkThumb + "/preview", // added preview for smaller sized pictures
            })
          )
        );
      } else {
        setListOfDrinks([]);
      }
    };

    getDrinksByIngredient();
  }, []);

  // keep track of scroll position
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // clean up
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <>
      {currentDrinks.length !== 0 ? (
        <h2 className="list-title">{name} is used to make:</h2>
      ) : null}

      <section className="drink-card-list">
        {currentDrinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            name={drink.name}
            id={drink.id}
            image={drink.image}
            style="small-list-cards"
          />
        ))}
      </section>
      {
        // only show message when there are still drinks to show
        listOfDrinks.length / drinksPerBatch > drinkBatch ? (
          <p>scroll to load more drinks</p>
        ) : null
      }
    </>
  );
}

export default DrinksByIngredient;
