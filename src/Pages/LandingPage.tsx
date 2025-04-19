import DrinkCard from "../Components/DrinkCard";
import Button from "../Components/Button";
import { useEffect, useState } from "react";
import { useCheckboxContext } from "../Context/CheckBoxContext.tsx";
import "./css/landingPage.css";
import SkeletonCard from "../Skeletons/SkeletonCard.tsx";
import { IDrink } from "../interfaces.tsx";

function LandingPage() {
  // State & context
  const [activeDrink, setActiveDrink] = useState<IDrink>();
  const { isNonAlcoholic, setIsNonAlcoholic } = useCheckboxContext();

  // fetch random drink from API
  const handleOnGetRandomDrink = async () => {
    let url: string;
    // if non-alcholic is checked, fetch only non-alcholic drinks
    if (isNonAlcoholic) {
      url =
        "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic";
      const response = await fetch(url);
      const data = await response.json();

      //function to randomize the drink that becomes active
      const randomIndex = Math.floor(Math.random() * data.drinks.length);
      const randomDrink = data.drinks[randomIndex];

      setActiveDrink({
        name: randomDrink.strDrink,
        id: randomDrink.idDrink,
        image: randomDrink.strDrinkThumb,
      });

      // else fetch any random drink
    } else {
      url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
      const response = await fetch(url);
      const data = await response.json();
      setActiveDrink({
        name: data.drinks[0].strDrink,
        id: data.drinks[0].idDrink,
        image: data.drinks[0].strDrinkThumb,
      });
    }
  };

  const handleCheckboxChange = () => {
    if (setIsNonAlcoholic) {
      setIsNonAlcoholic(!isNonAlcoholic);
    }
  };

  // fetch random drink
  useEffect(() => {
    handleOnGetRandomDrink();
  }, [isNonAlcoholic]);

  // change title in browser to reflect current page
  useEffect(() => {
    document.title = `Cocktail Wiki - Find Your Favorite Drink!`;
  }, []);

  return (
    <section className="landing-page">
      {activeDrink ? (
        <DrinkCard
          name={activeDrink.name}
          id={activeDrink.id}
          image={activeDrink.image}
          style="drink-card"
        />
      ) : (
        // show while activeDrink isn't set
        <SkeletonCard />
      )}

      <Button
        label={"Get a new random drink"}
        onClick={handleOnGetRandomDrink}
        className="button"
      />

      <div className="filter">
        <label>
          <input
            type="checkbox"
            checked={isNonAlcoholic}
            onChange={handleCheckboxChange}
          />
          Show non-alcoholic drinks
        </label>
      </div>
    </section>
  );
}

export default LandingPage;
