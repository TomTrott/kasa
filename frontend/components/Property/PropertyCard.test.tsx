import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import PropertyCard from "./PropertyCard";
import api from "@/services/api";

// Mock du service API pour ne pas faire de vrais appels réseau
jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("PropertyCard", () => {
  const property = {
    id: "1",
    title: "Villa Luxe",
    cover: "/villa.jpg",
    location: "Paris",
    price_per_night: 150,
  };

  // Simule un utilisateur connecté avant chaque test
  beforeEach(() => {
    localStorage.setItem("token", "token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1 })
    );
  });

  // Nettoie les mocks et le localStorage après chaque test
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("charge le statut favori", async () => {
    // La propriété est déjà dans les favoris de l'utilisateur
    mockedApi.get.mockResolvedValue({
      data: [{ id: "1" }],
    } as any);

    render(
      <PropertyCard property={property} />
    );

    // On attend que le bouton apparaisse dans son état "favori"
    // (loading terminé + favorite === true)
    await screen.findByRole("button", {
      name: /retirer des favoris/i,
    });

    // On vérifie que l'appel API a bien été fait avec la bonne URL
    expect(mockedApi.get).toHaveBeenCalledWith(
      "/api/users/1/favorites"
    );
  });

  it("ajoute un favori", async () => {
    // Aucune propriété en favori au départ
    mockedApi.get.mockResolvedValue({
      data: [],
    } as any);

    // Mock de la requête d'ajout aux favoris
    mockedApi.post.mockResolvedValue(
      {} as any
    );

    render(
      <PropertyCard property={property} />
    );

    // On attend le bouton dans son état "pas favori"
    const button = await screen.findByRole(
      "button",
      { name: /ajouter aux favoris/i }
    );

    // On clique sur le bouton pour ajouter la propriété aux favoris
    fireEvent.click(button);

    // On vérifie que la requête POST a bien été envoyée
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        "/api/properties/1/favorite"
      );
    });
  });

  it("supprime un favori", async () => {
    // La propriété est déjà dans les favoris
    mockedApi.get.mockResolvedValue({
      data: [{ id: "1" }],
    } as any);

    // Mock de la requête de suppression des favoris
    mockedApi.delete.mockResolvedValue(
      {} as any
    );

    render(
      <PropertyCard property={property} />
    );

    // On attend le bouton dans son état "favori"
    const button = await screen.findByRole(
      "button",
      { name: /retirer des favoris/i }
    );

    // On clique sur le bouton pour retirer la propriété des favoris
    fireEvent.click(button);

    // On vérifie que la requête DELETE a bien été envoyée
    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith(
        "/api/properties/1/favorite"
      );
    });
  });
});