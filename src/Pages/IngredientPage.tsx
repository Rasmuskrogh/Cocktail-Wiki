import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./css/IngredientPage.css";
import ChevronDown from "../assets/chevron-down.svg";
import { IIngredient } from "../interfaces";
import DrinksByIngredient from "../Components/DrinksByIngredient";
import ScrollToTop from "../Components/ScrollToTop";

function IngredientPage() {
  const { name } = useParams();
  const navigate = useNavigate();

  // States
  const [activeIngredient, setActiveIngredient] = useState<IIngredient>({
    name: "",
    id: 0,
    description: "",
    type: "",
    alcohol: "",
    strength: 0,
    image: "",
  });

  // States/ref for expandable description
  const [descExpand, setDescExpand] = useState<boolean>(false);
  const [descHeight, setDescHeight] = useState<null | number>(null);
  const descRef = useRef<null | HTMLElement>(null);

  // option to expand/close description when desc text is long
  const toggleDesc = () => {
    setDescExpand((prev) => {
      if (prev) {
        // 480px default max height
        setDescHeight(480);
      } else {
        // full height of description + 64px for some extra padding so button won't cover the text
        setDescHeight(descRef.current!.scrollHeight + 64);
      }
      return !prev;
    });
  };

  // fetch ingredient by name
  useEffect(() => {
    if (descRef.current) {
      setDescHeight(480);
    }
  }, []);

  useEffect(() => {
    const getIngredientInfo = async () => {
      try {
        const response = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${name}`
        );
        const data = await response.json();

        if (!data.ingredients || data.ingredients.length === 0) {
          navigate("/not-found");
          return;
        }

        setActiveIngredient({
          name: data.ingredients[0].strIngredient,
          id: data.ingredients[0].idIngredient,
          description: data.ingredients[0].strDescription,
          type: data.ingredients[0].strType,
          alcohol: data.ingredients[0].strAlcohol,
          strength: data.ingredients[0].strABV,
          image: `https://www.thecocktaildb.com/images/ingredients/${data.ingredients[0].strIngredient}.png`,
        });
      } catch (error) {
        console.error("Error fetching ingredient data:", error);
        navigate("/not-found");
      }
    };

    getIngredientInfo();
  }, [name, navigate]);

  // if description is bigger than max height, set it to max height
  useEffect(() => {
    if (descRef.current) {
      if (descRef.current.clientHeight > 480) {
        setDescHeight(480);
      }
    }
  }, [descRef.current]);

  // change title in browser to reflect current page
  useEffect(() => {
    document.title = `Cocktail Wiki - ${name}`;
  }, []);

  return (
    <>
      <section className="ingredient-info">
        <section className="image-wrapper">
          <figure className="image">
            <img src={activeIngredient.image} alt={activeIngredient.name} />
          </figure>

          <h1>{activeIngredient.name}</h1>

          <h3>{activeIngredient.type}</h3>
          <p>Alcoholic: {activeIngredient.alcohol}</p>
          {activeIngredient.strength ? (
            <p>Strength: {activeIngredient.strength}%</p>
          ) : (
            ""
          )}
        </section>
        {activeIngredient.description ? (
          <section
            className={descExpand ? "description" : "description closed"}
            ref={descRef}
            style={{ height: `${descHeight}px` }} // set height for transition to work
          >
            <h2>Description</h2>
            <p>{activeIngredient.description}</p>

            <div
              className={
                descRef.current && descRef.current.clientHeight < 480 // don't show if desc height is smaller than 480
                  ? "expand-btn d-none"
                  : !descExpand // check if desc is already open or not
                  ? "expand-btn"
                  : "expand-btn close"
              }
              onClick={toggleDesc}
            >
              <img src={ChevronDown} alt="Expand" />
            </div>
          </section>
        ) : null}

        <DrinksByIngredient name={name!} />
        <ScrollToTop />
      </section>
    </>
  );
}

export default IngredientPage;
