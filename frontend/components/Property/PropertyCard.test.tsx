import { render, screen, fireEvent } from "@testing-library/react";
import PropertyCard from "./PropertyCard";
import { useFavorites } from "@/contexts/FavoritesContext";

// On mocke le hook useFavorites : PropertyCard ne fait plus aucun appel API
jest.mock("@/contexts/FavoritesContext", () => ({
  useFavorites: jest.fn(),
}));

// Cast pour avoir accès aux méthodes de mock de Jest
const mockedUseFavorites = useFavorites as jest.Mock;

describe("PropertyCard", () => {
  // Propriété factice réutilisée dans tous les tests
  const property = {
    id: "1",
    title: "Villa Luxe",
    cover: "/villa.jpg",
    location: "Paris",
    price_per_night: 150,
  };

  // Réinitialise les mocks après chaque test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("affiche le bouton dans l'état favori quand la propriété est déjà en favori", () => {
    // Simule un Context où cette propriété est déjà marquée comme favorite
    mockedUseFavorites.mockReturnValue({
      isFavorite: jest.fn().mockReturnValue(true),
      toggleFavorite: jest.fn(),
      loading: false,
    });

    render(<PropertyCard property={property} />);

    // Le bouton doit afficher le libellé "Retirer des favoris"
    expect(
      screen.getByRole("button", { name: /retirer des favoris/i })
    ).toBeInTheDocument();
  });

  it("affiche le bouton dans l'état non-favori quand la propriété n'est pas en favori", () => {
    // Simule un Context où cette propriété n'est pas favorite
    mockedUseFavorites.mockReturnValue({
      isFavorite: jest.fn().mockReturnValue(false),
      toggleFavorite: jest.fn(),
      loading: false,
    });

    render(<PropertyCard property={property} />);

    // Le bouton doit afficher le libellé "Ajouter aux favoris"
    expect(
      screen.getByRole("button", { name: /ajouter aux favoris/i })
    ).toBeInTheDocument();
  });

  it("n'affiche pas le bouton favori tant que le Context est en chargement", () => {
    // Simule l'état initial du Context : les favoris sont encore en cours de chargement
    mockedUseFavorites.mockReturnValue({
      isFavorite: jest.fn().mockReturnValue(false),
      toggleFavorite: jest.fn(),
      loading: true,
    });

    render(<PropertyCard property={property} />);

    // Le bouton favori est masqué tant qu'on ne sait pas encore si la propriété est en favori ou non
    expect(
      screen.queryByRole("button", { name: /favoris/i })
    ).not.toBeInTheDocument();
  });

  it("appelle toggleFavorite avec la propriété complète au clic", () => {
    // On isole toggleFavorite dans sa propre variable pour pouvoir vérifier précisément avec quels arguments il a été appelé
    const toggleFavorite = jest.fn();

    mockedUseFavorites.mockReturnValue({
      isFavorite: jest.fn().mockReturnValue(false),
      toggleFavorite,
      loading: false,
    });

    render(<PropertyCard property={property} />);

    const button = screen.getByRole("button", {
      name: /ajouter aux favoris/i,
    });

    // Simule le clic utilisateur sur le cœur
    fireEvent.click(button);

    // toggleFavorite doit recevoir l'objet property complet pas juste l'id
    expect(toggleFavorite).toHaveBeenCalledWith(property);
  });
});