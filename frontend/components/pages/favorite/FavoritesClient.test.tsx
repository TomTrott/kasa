import { render, screen } from "@testing-library/react";
import FavoritesClient from "./FavoritesClient";
import { useFavorites } from "@/contexts/FavoritesContext";

// On mocke le composant PropertyCard 
jest.mock("@/components/Property/PropertyCard", () => {
  return function MockPropertyCard({
    property,
  }: {
    property: { title: string };
  }) {
    return <div>{property.title}</div>;
  };
});

// On mocke le hook useFavorites 
jest.mock("@/contexts/FavoritesContext", () => ({
  useFavorites: jest.fn(),
}));

const mockedUseFavorites = useFavorites as jest.Mock;

describe("FavoritesClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste l'affichage de l'état de chargement pendant que le Context récupère les favoris
  it("affiche l'état de chargement", () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      loading: true,
    });

    render(<FavoritesClient />);

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  // Teste l'affichage des favoris fournis par le Context
  it("affiche les favoris", () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [{ id: "1", title: "Villa Luxe" }],
      loading: false,
    });

    render(<FavoritesClient />);

    expect(screen.getByText("Villa Luxe")).toBeInTheDocument();
  });

  // Teste l'affichage du message "Aucun favori" quand la liste est vide
  it("affiche aucun favori", () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      loading: false,
    });

    render(<FavoritesClient />);

    expect(screen.getByText("Aucun favori")).toBeInTheDocument();
  });

  // Teste que FavoritesClient se met à jour dès que le Context change de valeur
  it("se met à jour quand le Context change", () => {
    mockedUseFavorites.mockReturnValue({
      favorites: [],
      loading: false,
    });

    const { rerender } = render(<FavoritesClient />);
    expect(screen.getByText("Aucun favori")).toBeInTheDocument();

    // Simule un changement du state partagé du Context
    mockedUseFavorites.mockReturnValue({
      favorites: [{ id: "1", title: "Maison Test" }],
      loading: false,
    });

    rerender(<FavoritesClient />);

    expect(screen.getByText("Maison Test")).toBeInTheDocument();
  });
});