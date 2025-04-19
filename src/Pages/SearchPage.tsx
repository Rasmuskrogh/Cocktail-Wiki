import { FormEvent, useContext, useEffect, useRef, useState } from "react";

import "./css/SearchPage.css";
import DrinkCard from "../Components/DrinkCard";
import Button from "../Components/Button";
import SkeletonCard from "../Skeletons/SkeletonCard";
import Select from "../Components/Select";
import { SearchContext } from "../Context/SearchContext";
import ScrollToTop from "../Components/ScrollToTop";

interface IDrinkResponse {
  strDrink: string;
  idDrink: string;
  strDrinkThumb: string;
}

interface ICategoryResponse {
  strCategory: string;
}

interface IGlassResponse {
  strGlass: string;
}

interface IIngredientResponse {
  strIngredient1: string;
}

function SearchPage() {
  // STATES & ref
  // pagination
  const drinksPerPage = 10;
  const {
    foundDrinks,
    setFoundDrinks,
    searchMessage,
    setSearchMessage,
    searchedValue,
    setSearchedValue,
  } = useContext(SearchContext);
  const [currentPage, setCurrentPage] = useState(1);
  // search message
  // const [searchMessage, setSearchMessage] = useState<string>("");
  // state for placeholders while loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // form
  const [filtersCategory, setFiltersCategory] = useState<string[]>([]);
  const [filtersGlass, setFiltersGlass] = useState<string[]>([]);
  const [filtersIngredient, setFiltersIngredient] = useState<string[]>([]);
  const [filtersAlcohol, setFiltersAlcohol] = useState<string[]>([]);
  const inputRef = useRef<null | HTMLInputElement>(null);

  // fetch drinks by search from API
  const handleOnSearch = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      setIsLoading(true);
      // variables for the form values
      const form = event.target as HTMLFormElement;
      const category = form.category.value as HTMLSelectElement;
      const glass = form.glass.value as HTMLSelectElement;
      const ingredient = form.ingredient.value as HTMLSelectElement;
      const alcohol = form.alcohol.value as HTMLSelectElement;
      // current drinks (used to keep track of what drinks to eventually display to user)
      let currentDrinks = [];
      // search term to keep track of if user entered a search term (to know how to handle the first filterSearch)
      let searchTerm;
      // check if entered input is valid
      if (inputRef.current!.value.trim().length > 0) {
        // remember input value in context
        setSearchedValue!(inputRef.current!.value.trim());

        const response = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${inputRef.current!.value.trim()}`
        );
        const data = await response.json();
        searchTerm = true;

        if (data.drinks !== null) {
          currentDrinks = data.drinks;
        }
      } else {
        searchTerm = false;
      }
      // check all filter options if active, and make sure searchTerm is set to true after
      if (category) {
        currentDrinks = await filterSearch(
          "c",
          category,
          currentDrinks,
          searchTerm
        );
        searchTerm = true;
      }
      if (glass) {
        currentDrinks = await filterSearch(
          "g",
          glass,
          currentDrinks,
          searchTerm
        );
        searchTerm = true;
      }
      if (ingredient) {
        currentDrinks = await filterSearch(
          "i",
          ingredient,
          currentDrinks,
          searchTerm
        );
        searchTerm = true;
      }
      if (alcohol) {
        currentDrinks = await filterSearch(
          "a",
          alcohol,
          currentDrinks,
          searchTerm
        );
        searchTerm = true;
      }

      if (setFoundDrinks && setSearchMessage) {
        // if no valid search and no filters selected
        if (
          inputRef.current!.value.trim().length === 0 &&
          !category &&
          !glass &&
          !ingredient &&
          !alcohol
        ) {
          setFoundDrinks([]);
          setSearchMessage(
            "Please enter a valid search term or apply a filter"
          );
        } else {
          // set drink message and set found drinks based on current drinks
          messageForDrinksFound(currentDrinks!);
          setFoundDrinks(
            currentDrinks!.map((drink: IDrinkResponse) => ({
              name: drink.strDrink,
              id: drink.idDrink,
              image: drink.strDrinkThumb + "/preview",
            }))
          );
        }
      }

      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // fetch drinks based on filter and compare to currentDrinks
  const filterSearch = async (
    filterKey: string,
    filterTerm: HTMLSelectElement,
    currentDrinks: IDrinkResponse[] | undefined,
    searchTerm: boolean
  ) => {
    try {
      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?${filterKey}=${filterTerm}`
      );
      const data = await response.json();
      // if searchTerm is true, compare response data to currentDrinks and filter out the matches into currentDrinks
      if (searchTerm && currentDrinks) {
        currentDrinks = currentDrinks.filter((currentDrink: IDrinkResponse) =>
          data.drinks.some(
            (drink: IDrinkResponse) => drink.idDrink === currentDrink.idDrink
          )
        );
        return currentDrinks;
        // if searchTerm is false, set currentDrinks to response data directly
        // (cannot just check if currentDrinks is an empty array, since a valid search still could result in no results)
      } else {
        return data.drinks;
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // what message to display to user after search
  const messageForDrinksFound = (drinks: [] | null) => {
    if (setSearchMessage) {
      if (drinks === null) {
        setSearchMessage("No drinks found");
      } else {
        if (drinks!.length === 0) {
          setSearchMessage("No drinks found");
        } else if (drinks!.length === 1) {
          setSearchMessage(`${drinks!.length} drink found`);
        } else {
          setSearchMessage(`${drinks!.length} drinks found`);
        }
      }
    }
  };

  // pagination
  const lastDrink = currentPage * drinksPerPage;
  const firstDrink = lastDrink - drinksPerPage;
  const currentDrinks = foundDrinks!.slice(firstDrink, lastDrink);

  const nextPage = () => {
    if (Math.ceil(foundDrinks!.length / drinksPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // fetch filter options from API
  useEffect(() => {
    const getFilters = async (filterKey: string, filterType: string) => {
      try {
        const response = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/list.php?${filterKey}=list`
        );
        const data = await response.json();
        const filterOptions = data.drinks.map(
          (
            drink:
              | ICategoryResponse
              | IGlassResponse
              | IIngredientResponse
              | { strAlcoholic: string }
          ) => drink[filterType as keyof typeof drink]
        );

        return filterOptions;
      } catch (error) {
        console.log(error);
        return [];
      }
    };
    // get arrays of all the filter options
    const setupFilters = async () => {
      const categoryFilters = await getFilters("c", "strCategory");
      const glassFilters = await getFilters("g", "strGlass");
      const ingredientFilters = await getFilters("i", "strIngredient1");
      const alcoholFilters = await getFilters("a", "strAlcoholic");

      if (categoryFilters) setFiltersCategory(categoryFilters);
      if (glassFilters) setFiltersGlass(glassFilters);
      if (ingredientFilters) setFiltersIngredient(ingredientFilters);
      if (alcoholFilters) setFiltersAlcohol(alcoholFilters);
    };
    setupFilters();
  }, []);

  // change title in browser to reflect current page
  useEffect(() => {
    document.title = `Cocktail Wiki - Search`;
  }, []);

  return (
    <>
      <section className="search">
        <form className="search-form" onSubmit={handleOnSearch}>
          <h2>Search</h2>
          <div>
            <input
              type="text"
              placeholder="drink name..."
              defaultValue={searchedValue ? searchedValue : ""}
              ref={inputRef}
            />
            <Button className={"search-button"} label={"Search"} />
          </div>
          <h2>Filters</h2>
          <div className="filters">
            <Select
              id="category"
              label="Select Category:"
              options={filtersCategory}
            ></Select>
            <Select
              id="glass"
              label="Select Glass:"
              options={filtersGlass}
            ></Select>
            <Select
              id="ingredient"
              label="Select Ingredient:"
              options={filtersIngredient}
            ></Select>
            <Select
              id="alcohol"
              label="Alcohol status:"
              options={filtersAlcohol}
            ></Select>
          </div>
        </form>
      </section>
      <p className="search-message">{searchMessage}</p>
      {foundDrinks!.length < 11 ? (
        ""
      ) : (
        <section className="searchPage-button-section">
          <Button
            onClick={prevPage}
            label={"Back"}
            disabled={currentPage === 1 ? true : false}
          />
          <Button
            onClick={nextPage}
            label={"Next"}
            disabled={
              currentPage === Math.ceil(foundDrinks!.length / drinksPerPage)
                ? true
                : false
            }
          />
        </section>
      )}
      <section className="drink-card-grid">
        {
          // when isLoading, show skeleton placeholders
          isLoading
            ? [1, 2, 3, 4, 5].map((n) => <SkeletonCard key={n} />)
            : currentDrinks.map((drink) => (
                <DrinkCard
                  key={drink.id}
                  name={drink.name}
                  id={drink.id}
                  image={drink.image}
                  style="drink-card"
                />
              ))
        }
      </section>
      {foundDrinks!.length < 11 ? (
        ""
      ) : (
        <section className="searchPage-button-section bottom">
          <Button
            onClick={prevPage}
            label={"Back"}
            disabled={currentPage === 1 ? true : false}
          />
          <Button
            onClick={nextPage}
            label={"Next"}
            disabled={
              currentPage === Math.ceil(foundDrinks!.length / drinksPerPage)
                ? true
                : false
            }
          />
        </section>
      )}
      <ScrollToTop />
    </>
  );
}

export default SearchPage;
